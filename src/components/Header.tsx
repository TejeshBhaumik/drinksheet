import { A } from "@solidjs/router";
import type { ParentProps } from "solid-js";

export function Header() {
  return (
    <header class="header">
      <div class="container header__inner">
        <A href="/" class="logo">
          Drinksheet
        </A>
      </div>
    </header>
  );
}

export function Layout(props: ParentProps) {
  return (
    <div class="app">
      <Header />
      <main class="container">{props.children}</main>
    </div>
  );
}
