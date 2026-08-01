declare module "*.jsx" {
  const component: (props: Record<string, unknown>) => JSX.Element;
  export default component;
}

declare module "../App" {
  export const App: () => JSX.Element;
  const Default: () => JSX.Element;
  export default Default;
}
