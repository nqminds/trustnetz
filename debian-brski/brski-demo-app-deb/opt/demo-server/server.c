#include <microhttpd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <sys/select.h>
#include <sys/time.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>
#include "config.h" 

#define DEFAULT_PORT 8082

int write_port_to_conf_file(int port) {
    char tempFileName[] = TEMP_PORT_FILE_PATH;
    FILE *file = fopen(CONFIG_FILE_PATH, "r");
    if (file == NULL) {
        perror("Failed to open config file for reading");
        return -1;
    }
    
    int tempFileDescriptor = mkstemp(tempFileName);
    if (tempFileDescriptor == -1) {
        perror("Failed to create temporary file");
        fclose(file);
        return -1;
    }
    FILE *tempFile = fdopen(tempFileDescriptor, "w");
    if (tempFile == NULL) {
        perror("Failed to open temporary file for writing");
        close(tempFileDescriptor);
        fclose(file);
        return -1;
    }

    char line[1024];
    int portFound = 0;
    while (fgets(line, 1024, file) != NULL) {
        if (strncmp(line, "port=", 5) == 0) {
            fprintf(tempFile, "port=%d\n", port);
            portFound = 1;
        } else {
            fputs(line, tempFile);
        }
    }
    
    if (!portFound) {
        fprintf(tempFile, "port=%d\n", port);
    }

    fclose(file);
    fclose(tempFile);
    
    if (rename(tempFileName, CONFIG_FILE_PATH) != 0) {
        perror("Failed to update config file");
        return -1;
    }

    return 0;
}

void logging_function(void *cls, const char *fmt, va_list ap) {
    // handle a varying number of args
    vfprintf(stderr, fmt, ap);
}

static int execute_script(const char *script) {
    fprintf(stdout, "Attempting to execute script: %s\n", script); // Log script execution attempt
    int result = system(script);
    if(result != 0) {
        fprintf(stderr, "Error executing script: %s\n", script);
    } else {
        fprintf(stdout, "Script executed successfully: %s\n", script); // Log successful script execution
    }
    return result;
}

static int serve_file(const char *filename, struct MHD_Response **response) {
    FILE *file = fopen(filename, "rb");
    if (file == NULL) {
        perror("Error opening file");
        return MHD_NO;
    }

    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    rewind(file);

    char *buffer = malloc(size);
    if (buffer == NULL) {
        perror("Memory allocation failed");
        fclose(file);
        return MHD_NO;
    }

    size_t read_bytes = fread(buffer, 1, size, file);
    if (read_bytes != size) {
        fprintf(stderr, "Error reading file: %s\n", filename);
        free(buffer);
        fclose(file);
        return MHD_NO;
    }

    *response = MHD_create_response_from_buffer(size, buffer, MHD_RESPMEM_MUST_FREE);
    fclose(file);

    return MHD_YES;
}

static int execute_script_async(const char *script, const char *output_file) {
    pid_t pid = fork();
    if (pid == -1) {
        // Handle error in fork
        return -1;
    } else if (pid > 0) {
        // Parent process
        fprintf(stdout, "Started script (PID: %d): %s\n", pid, script);
        return 0;
    } else {
        // Child process
        int fd = open(output_file, O_WRONLY | O_CREAT | O_TRUNC, 0644);
        if (fd == -1) {
            fprintf(stderr, "Failed to open output file: %s\n", output_file);
            exit(EXIT_FAILURE);
        }

        dup2(fd, STDOUT_FILENO); // Redirect stdout to output file
        dup2(fd, STDERR_FILENO); // Redirect stderr to output file
        close(fd);

        execl("/bin/bash", "bash", "-c", script, (char *) NULL);
        fprintf(stderr, "Failed to execute script: %s\n", script);
        exit(EXIT_FAILURE);
    }
}

static int handle_wlan0_status(struct MHD_Connection *connection) {
    char buffer[1024];
    FILE *fp = popen("iw wlan0 link", "r");
    if (fp == NULL) {
        fprintf(stderr, "Failed to run command\n");
        return MHD_NO;
    }

    // Use dynamic string to accumulate the output
    size_t capacity = 1024;
    size_t size = 0;
    char *output = malloc(capacity);
    if (output == NULL) {
        perror("Memory allocation failed");
        pclose(fp);
        return MHD_NO;
    }

    // Read the output in chunks
    while (fgets(buffer, sizeof(buffer), fp) != NULL) {
        size_t chunk_size = strlen(buffer);
        if (size + chunk_size >= capacity) {
            capacity *= 2; // Double the capacity
            char *new_output = realloc(output, capacity);
            if (new_output == NULL) {
                perror("Memory reallocation failed");
                free(output);
                pclose(fp);
                return MHD_NO;
            }
            output = new_output;
        }
        memcpy(output + size, buffer, chunk_size);
        size += chunk_size;
    }
    output[size] = '\0'; // Null-terminate the output

    pclose(fp);

    struct MHD_Response *response = MHD_create_response_from_buffer(size, output, MHD_RESPMEM_MUST_FREE);
    int ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
    MHD_destroy_response(response);
    return ret;
}

static int execute_ping(const char *interface, const char *ip_address, char **output) {
    char command[256];
    snprintf(command, sizeof(command), "ping -c 3 -I %s %s", interface, ip_address);

    FILE *fp = popen(command, "r");
    if (fp == NULL) {
        fprintf(stderr, "Failed to run ping command\n");
        return -1;
    }

    size_t capacity = 1024;
    *output = malloc(capacity);
    if (*output == NULL) {
        perror("Memory allocation failed");
        pclose(fp);
        return -1;
    }

    size_t size = 0;
    while (!feof(fp)) {
        if (size >= capacity) {
            capacity *= 2;
            char *new_output = realloc(*output, capacity);
            if (new_output == NULL) {
                perror("Memory reallocation failed");
                free(*output);
                pclose(fp);
                return -1;
            }
            *output = new_output;
        }

        size += fread(*output + size, 1, capacity - size, fp);
    }
    (*output)[size] = '\0';

    pclose(fp);
    return 0;
}


static enum MHD_Result answer_to_connection(void *cls, struct MHD_Connection *connection,
                                            const char *url, const char *method,
                                            const char *version, const char *upload_data,
                                            size_t *upload_data_size, void **con_cls) {
    static int dummy;
    enum MHD_Result ret;

    if (strcmp(url, "/ping") == 0 && strcmp(method, "GET") == 0) {
        const char *ip = MHD_lookup_connection_value(connection, MHD_GET_ARGUMENT_KIND, "ip");
        const char *interface = MHD_lookup_connection_value(connection, MHD_GET_ARGUMENT_KIND, "interface");
    
        if (ip == NULL || interface == NULL) {
            const char *error_message = "Both IP address and interface are required.";
            struct MHD_Response *response = MHD_create_response_from_buffer(strlen(error_message),
                                                                            (void *)error_message, MHD_RESPMEM_PERSISTENT);
            ret = MHD_queue_response(connection, MHD_HTTP_BAD_REQUEST, response);
            MHD_destroy_response(response);
            return ret;
        }

        char *ping_output = NULL;
        if (execute_ping(interface, ip, &ping_output) != 0 || ping_output == NULL) {
            const char *error_message = "Failed to execute ping";
            struct MHD_Response *response = MHD_create_response_from_buffer(strlen(error_message),
                                                                            (void *)error_message, MHD_RESPMEM_PERSISTENT);
            ret = MHD_queue_response(connection, MHD_HTTP_INTERNAL_SERVER_ERROR, response);
            MHD_destroy_response(response);
            return ret;
        }

        struct MHD_Response *response = MHD_create_response_from_buffer(strlen(ping_output),
                                                                    ping_output, MHD_RESPMEM_MUST_FREE);
        ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
        MHD_destroy_response(response);
        return ret;
    }

    if (strcmp(url, "/wlan0-status") == 0) {
        return handle_wlan0_status(connection);
    }
    
    if (strcmp(method, "GET") == 0) {
        struct MHD_Response *response;
        int ret;

        // Serve index.html for the root path
        if (strcmp(url, "/") == 0) {
            url = "/index.html";
        }

        char filepath[1024];
        snprintf(filepath, sizeof(filepath), "%s%s", HTML_BASE_PATH, url);

        if (serve_file(filepath, &response) == MHD_YES) {
            ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
            MHD_destroy_response(response);
            return ret;
        } else {
            const char *not_found_page = "File not found";
            response = MHD_create_response_from_buffer(strlen(not_found_page),
                                                       (void *)not_found_page,
                                                       MHD_RESPMEM_PERSISTENT);
            ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
            MHD_destroy_response(response);
            return ret;
        }
    } else if (strcmp(method, "POST") == 0) {
        if (0 != *upload_data_size) {
            *upload_data_size = 0; // Reset upload size
            return MHD_YES; // Indicate that we've handled the upload data
        }

        // Handling POST request with no data to upload or after data has been received, can add logs here
        const char *ok_page = "Logs";
        struct MHD_Response *response = MHD_create_response_from_buffer(strlen(ok_page),
                                                                        (void *)ok_page,
                                                                        MHD_RESPMEM_PERSISTENT);

        if (strcmp(url, "/onboard") == 0) {
            const char *output_file = ONBOARDING_LOG_FILE_PATH;
            // Execute the onboarding script
            int script_result = execute_script_async(ONBOARDING_SCRIPT_PATH, output_file);
            
            sleep(5);
            
            FILE *file = fopen(output_file, "r");
            if (file == NULL) {
                perror("Error opening log file");
            
                return MHD_NO;
            }

            fseek(file, 0, SEEK_END);
            long size = ftell(file);
            rewind(file);

            char *buffer = malloc(size + 1);
            if (buffer == NULL) {
                perror("Memory allocation failed");
                fclose(file);
                return MHD_NO;
            }

            fread(buffer, 1, size, file);
            buffer[size] = '\0'; // Null-terminate the buffer
            fclose(file);

            struct MHD_Response *response = MHD_create_response_from_buffer(size, buffer, MHD_RESPMEM_MUST_FREE);
            int ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
            MHD_destroy_response(response);

            return ret;
        } else if (strcmp(url, "/offboard") == 0) {
            fprintf(stdout, "Received offboard request\n");
            const char *output_file = OFFBOARDING_LOG_FILE_PATH;

            execute_script_async(OFFBOARDING_SCRIPT_PATH, output_file);
            const char *ok_page = "Offboarding initiated";
            response = MHD_create_response_from_buffer(strlen(ok_page),
                                                       (void *)ok_page,
                                                       MHD_RESPMEM_PERSISTENT);
            ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
            MHD_destroy_response(response);
            return ret;

        } else {
            const char *not_found_page = "Not Found";
            response = MHD_create_response_from_buffer(strlen(not_found_page),
                                                       (void *)not_found_page,
                                                       MHD_RESPMEM_PERSISTENT);
            ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
            MHD_destroy_response(response);
            return ret;
        }

        ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
        MHD_destroy_response(response);
        return ret;
    } else {
        const char *error_page = "Method Not Allowed";
        struct MHD_Response *response = MHD_create_response_from_buffer(strlen(error_page),
                                                                        (void *)error_page,
                                                                        MHD_RESPMEM_PERSISTENT);

        MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");

        ret = MHD_queue_response(connection, MHD_HTTP_METHOD_NOT_ALLOWED, response);
        MHD_destroy_response(response);
        return ret;
    }
}

int main(int argc, char *argv[]) {

    int port = DEFAULT_PORT;

    // cmd line args
    for (int i = 1; i< argc; i++) {
        if (strcmp(argv[i], "-p") == 0 && i + 1 < argc) {
            port = atoi(argv[i + 1]);
            if (port <= 0) {
                fprintf(stderr, "Invalid port number: %s\n", argv[i + 1]);
                return 1;
            }
            i++; // skip port number
        }
    }

    // write port number to config
    if (write_port_to_conf_file(port) != 0) {
        return 1; // exit if failed to write
    }

    struct MHD_Daemon *daemon;

    daemon = MHD_start_daemon(MHD_USE_ERROR_LOG, port, NULL, NULL,
                              &answer_to_connection, NULL, MHD_OPTION_EXTERNAL_LOGGER, logging_function, NULL, MHD_OPTION_END);
    if (NULL == daemon) {
        fprintf(stderr, "Failed to start the server\n");
        return 1;
    }

    fprintf(stdout, "Server running on port %d\n", port);

   // Server loop using select
    fd_set rs, ws, es;
    MHD_socket maxfd;
    struct timeval tv;
    struct timeval *tvp;
    unsigned long long timeout;

    while (1) {
        maxfd = 0;
        FD_ZERO(&rs);
        FD_ZERO(&ws);
        FD_ZERO(&es);

        if (MHD_get_fdset(daemon, &rs, &ws, &es, &maxfd) != MHD_YES) {
            fprintf(stderr, "Failed to get file descriptor set\n");
            break;
        }

        if (MHD_get_timeout(daemon, &timeout) == MHD_YES) {
            tv.tv_sec = timeout / 1000;
            tv.tv_usec = (timeout % 1000) * 1000;
            tvp = &tv;
        } else {
            tvp = NULL;
        }

        int activity = select(maxfd + 1, &rs, &ws, &es, tvp);
        if (activity == -1) {
            if (errno != EINTR) {
                fprintf(stderr, "Select error: %s\n", strerror(errno));
                break;
            }
        } else if (activity == 0) {
            fprintf(stdout, "Select timeout\n");
        } else {
            MHD_run(daemon);
        }
    }

    MHD_stop_daemon(daemon);
    fprintf(stdout,"Server has been stopped\n");
    return 0;
}
