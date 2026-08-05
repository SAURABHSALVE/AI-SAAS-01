import "@stream-io/video-react-sdk/dist/css/styles.css";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
};

export default Layout;
