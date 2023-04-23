export abstract class ExpressError {
  name = this.constructor.name;
  detail: string;

  constructor(detail: string) {
    this.detail = detail;
  }
}

export abstract class InternalServerError extends ExpressError {}
export abstract class BadRequestError extends ExpressError {}

export class InvalidCredential extends BadRequestError {
  name: 'InvalidCredential';
  constructor() {
    super('Invalid email or password');
  }
}
export class InvalidApiToken extends BadRequestError {
  name: 'InvalidApiToken';
  constructor() {
    super('This token is invalid');
  }
}

export class MissingProperties extends BadRequestError {}
export class InvalidPropertyType extends BadRequestError {}

export class InvalidSensorList extends BadRequestError {}
export class ClientIdMissing extends BadRequestError {}
export class RequestClientIdNotFound extends BadRequestError {}
export class ValidationError extends BadRequestError {}

export class RequestSensorIdNotConnect extends BadRequestError {}

export class InvalidSensorId extends BadRequestError {
  constructor(id: number) {
    super(`Invalid sensor Id: ${id}`);
  }
}

export class MissingComponent extends InternalServerError {}
export class FailedToForwardCommand extends InternalServerError {}
export class NotImplemented extends InternalServerError {}

export class UnknownError extends InternalServerError {
  constructor(exception?: unknown) {
    super(`Unknown error: ${exception}`);
  }
}

export class Unauthorized extends ExpressError {
  constructor() {
    super('You must login first to access this resource');
  }
}
