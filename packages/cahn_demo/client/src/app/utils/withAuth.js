import { useEffect } from "react";
import { useRouter } from "next/navigation";

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const emailAddress =
      typeof window !== "undefined"
        ? localStorage.getItem("emailAddress")
        : null;
    const privateKey =
      typeof window !== "undefined" ? localStorage.getItem("privateKey") : null;

    useEffect(() => {
      if (!emailAddress || !privateKey) {
        router.replace("/login");
      }
    }, [emailAddress, privateKey, router]);

    // If the emailAddress or privateKey is not available, you might want to render null or a loader
    if (!emailAddress || !privateKey) {
      return null; // or a loading spinner if desired
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
