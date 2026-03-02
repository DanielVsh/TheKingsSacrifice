import {useEffect} from "react";

export const PageTitle = ({ title }: { title: string }) => {

  useEffect(() => {
    document.title = title
  }, [])
  return (
    <>
    </>
    // <Helmet>
    //   <title>{title}</title>
    //   <meta property="og:title" content={title} />
    // </Helmet>
  );
};
