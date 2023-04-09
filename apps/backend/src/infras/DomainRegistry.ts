import { GetAllSensorUseCase, GetSingleSensorUseCase } from '../core/usecases';
import { ChangeSubscriptionUseCase } from '../core/usecases/ChangeSubscription';
import { SensorController } from '../core/usecases/gateways/SensorController';
import { GetAllNotificationsUseCase } from '../core/usecases/GetAllNotifications';
import { LoginUseCase } from '../core/usecases/Login';
import { ConfigManager } from '../core/usecases/manager/ConfigManager';
import { UserRepo } from '../core/usecases/repos/UserRepo';
import { ClientSubscribeUseCase } from '../core/usecases/StartClient';

export class UninitializedComponent implements Error {
  name: 'UninitializedComponent';
  message: string;

  constructor(componentName: string) {
    this.message = `Domain Registry does not contains component ${componentName}`;
  }
}

export class DomainRegistry {
  private static _instance: DomainRegistry;

  public static get Instance() {
    if (!this._instance) this._instance = new DomainRegistry();
    return this._instance;
  }

  private _configManager: ConfigManager;
  public get configManager() {
    if (!this._configManager) throw new UninitializedComponent('ConfigManager');
    return this._configManager;
  }
  public set configManager(configManager: ConfigManager) {
    this._configManager = configManager;
  }

  private _userRepo: UserRepo;
  public get userRepo() {
    if (!this._userRepo) throw new UninitializedComponent('UserRepo');
    return this._userRepo;
  }
  public set userRepo(userRepo: UserRepo) {
    this._userRepo = userRepo;
  }

  private _sensorController: SensorController;
  public get sensorController() {
    if (!this._sensorController) throw new UninitializedComponent('SensorController');
    return this._sensorController;
  }
  public set sensorController(sensorController: SensorController) {
    this._sensorController = sensorController;
  }

  private _getAllSensorsUC: GetAllSensorUseCase;
  public get getAllSensorsUC() {
    if (!this._getAllSensorsUC) throw new UninitializedComponent('GetAllSensorUseCase');
    return this._getAllSensorsUC;
  }
  public set getAllSensorsUC(getAllSensorsUC: GetAllSensorUseCase) {
    this._getAllSensorsUC = getAllSensorsUC;
  }

  private _getSingleSensorUC: GetSingleSensorUseCase;
  public get getSingleSensorUC() {
    if (!this._getSingleSensorUC) throw new UninitializedComponent('GetSingleSensorUseCase');
    return this._getSingleSensorUC;
  }
  public set getSingleSensorUC(getSingleSensorUC: GetSingleSensorUseCase) {
    this._getSingleSensorUC = getSingleSensorUC;
  }

  private _getAllNotificationsUC: GetAllNotificationsUseCase;
  public get getAllNotificationsUC() {
    if (!this._getAllNotificationsUC)
      throw new UninitializedComponent('GetAllNotificationsUseCase');
    return this._getAllNotificationsUC;
  }
  public set getAllNotificationsUC(getAllNotificationsUC: GetAllNotificationsUseCase) {
    this._getAllNotificationsUC = getAllNotificationsUC;
  }

  private _subscribeClientUC: ClientSubscribeUseCase;
  public get subscribeClientUC() {
    if (!this._subscribeClientUC) throw new UninitializedComponent('ClientSubscribeUseCase');
    return this._subscribeClientUC;
  }
  public set subscribeClientUC(subscribeClientUC: ClientSubscribeUseCase) {
    this._subscribeClientUC = subscribeClientUC;
  }

  private _changeClientSubscriptionUC: ChangeSubscriptionUseCase;
  public get changeClientSubscriptionUC() {
    if (!this._changeClientSubscriptionUC)
      throw new UninitializedComponent('ChangeSubscriptionUseCase');
    return this._changeClientSubscriptionUC;
  }
  public set changeClientSubscriptionUC(changeClientSubscriptionUC: ChangeSubscriptionUseCase) {
    this._changeClientSubscriptionUC = changeClientSubscriptionUC;
  }

  private _logUC: LoginUseCase;
  public get loginUC() {
    if (!this._logUC) throw new UninitializedComponent('LoginUseCase');
    return this._logUC;
  }
  public set loginUC(loginUC: LoginUseCase) {
    this._logUC = loginUC;
  }
}
