declare module '*.png' {
  /** Metro bundles a static image as a numeric asset id, which every Image component accepts. */
  const source: number;
  export default source;
}
