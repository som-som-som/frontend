import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function Layout(props: { children: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }){
    return (
        <form>
            <h2>Create</h2>
            {props.children}
        </form>
    )
}