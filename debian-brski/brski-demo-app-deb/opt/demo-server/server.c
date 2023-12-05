#include <microhttpd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <sys/select.h>
#include <sys/time.h>
#include <unistd.h>
#include <errno.h>

#define DEFAULT_PORT 8082

int write_port_to_conf_file(int port) {
    FILE *file = fopen("/opt/demo-server/html/server.conf", "w");
    if (file == NULL) {
        perror("Failed to open config file");
        return -1;
    }

    fprintf(file, "port=%d\n", port);
    fclose(file);
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

    fread(buffer, 1, size, file);
    *response = MHD_create_response_from_buffer(size, buffer, MHD_RESPMEM_MUST_FREE);
    fclose(file);

    return MHD_YES;
}

static enum MHD_Result answer_to_connection(void *cls, struct MHD_Connection *connection,
                                            const char *url, const char *method,
                                            const char *version, const char *upload_data,
                                            size_t *upload_data_size, void **con_cls) {
    static int dummy;
    enum MHD_Result ret;
    
    if (strcmp(method, "GET") == 0) {
        struct MHD_Response *response;
        int ret;

        // Serve index.html for the root path
        if (strcmp(url, "/") == 0) {
            url = "/index.html";
        }

        char filepath[1024];
        snprintf(filepath, sizeof(filepath), "/opt/demo-server/html%s", url);

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
            fprintf(stdout, "Received onboard request\n"); 
            execute_script("/opt/demo-server/bash-scripts/onboard.sh");
        } else if (strcmp(url, "/offboard") == 0) {
            fprintf(stdout, "Received offboard request\n"); 
            execute_script("/opt/demo-server/bash-scripts/offboard.sh");
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
