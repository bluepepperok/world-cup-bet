import { Fragment } from "react";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

export default function layout(props) {
  return (
    <Fragment>
      <Header></Header>
      <main>{props.children}</main>
      <Footer></Footer>
    </Fragment>
  );
}
