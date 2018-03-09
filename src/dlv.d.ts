declare module "dlv" {
  interface Dlv {
    <T>(o: T, k: any): any;
  }
  const dlv: Dlv;
  export default dlv;
}
