export default interface IUsecase<TDomain> {
  executeUsecase: () => Promise<TDomain>;
}
