import {
  ForwardNotificationUseCase,
  GetAllSensorUseCase,
  GetAnalysisDataForSensorUseCase,
  GetSingleSensorUseCase,
  GetTotalAnalysisDataUseCase,
} from '../core/usecases';
import { ChangeSubscriptionUseCase } from '../core/usecases/ChangeSubscription';
import { AnalysisTool } from '../core/usecases/gateways/AnalysisTool';
import { ClientManager } from '../core/usecases/gateways/ClientManager';
import { SensorController } from '../core/usecases/gateways/SensorController';
import { GetAllNotificationsUseCase } from '../core/usecases/GetAllNotifications';
import { LoginUseCase } from '../core/usecases/Login';
import { ConfigManager } from '../core/usecases/manager/ConfigManager';
import { NotificationRepo } from '../core/usecases/repos/NotificationRepo';
import { SensorRepo } from '../core/usecases/repos/SensorRepo';
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

  private _sensorRepo: SensorRepo;
  public get sensorRepo() {
    if (!this._sensorRepo) throw new UninitializedComponent('SensorRepo');
    return this._sensorRepo;
  }
  public set sensorRepo(sensorRepo: SensorRepo) {
    this._sensorRepo = sensorRepo;
  }

  private _userRepo: UserRepo;
  public get userRepo() {
    if (!this._userRepo) throw new UninitializedComponent('UserRepo');
    return this._userRepo;
  }
  public set userRepo(userRepo: UserRepo) {
    this._userRepo = userRepo;
  }

  private _notificationRepo: NotificationRepo;
  public get notificationRepo() {
    if (!this._notificationRepo) throw new UninitializedComponent('NotificationRepo');
    return this._notificationRepo;
  }
  public set notificationRepo(notificationRepo: NotificationRepo) {
    this._notificationRepo = notificationRepo;
  }

  private _clientManager: ClientManager;
  public get clientManager() {
    if (!this._clientManager) throw new UninitializedComponent('ClientManager');
    return this._clientManager;
  }
  public set clientManager(clientManager: ClientManager) {
    this._clientManager = clientManager;
  }

  private _sensorController: SensorController;
  public get sensorController() {
    if (!this._sensorController) throw new UninitializedComponent('SensorController');
    return this._sensorController;
  }
  public set sensorController(sensorController: SensorController) {
    this._sensorController = sensorController;
  }

  private _analysisTool: AnalysisTool;
  public get analysisTool() {
    if (!this._analysisTool) throw new UninitializedComponent('AnalysisTool');
    return this._analysisTool;
  }
  public set analysisTool(analysisTool: AnalysisTool) {
    this._analysisTool = analysisTool;
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

  private _loginUC: LoginUseCase;
  public get loginUC() {
    if (!this._loginUC) throw new UninitializedComponent('LoginUseCase');
    return this._loginUC;
  }
  public set loginUC(loginUC: LoginUseCase) {
    this._loginUC = loginUC;
  }

  private _getTotalStatisticUC: GetTotalAnalysisDataUseCase;
  public get getTotalStatisticUC() {
    if (!this._getTotalStatisticUC) throw new UninitializedComponent('GetTotalAnalysisDataUseCase');
    return this._getTotalStatisticUC;
  }
  public set getTotalStatisticUC(getTotalStatisticUC: GetTotalAnalysisDataUseCase) {
    this._getTotalStatisticUC = getTotalStatisticUC;
  }

  private _getAnalysisDataForSensorUC: GetAnalysisDataForSensorUseCase;
  public get getAnalysisDataForSensorUC() {
    if (!this._getAnalysisDataForSensorUC)
      throw new UninitializedComponent('GetAnalysisDataForSensorUseCase');
    return this._getAnalysisDataForSensorUC;
  }
  public set getAnalysisDataForSensorUC(
    getAnalysisDataForSensorUC: GetAnalysisDataForSensorUseCase
  ) {
    this._getAnalysisDataForSensorUC = getAnalysisDataForSensorUC;
  }

  private _ForwardNotificationUC: ForwardNotificationUseCase;
  public get forwardNotificationUC() {
    if (!this._ForwardNotificationUC)
      throw new UninitializedComponent('ForwardNotificationUseCase');
    return this._ForwardNotificationUC;
  }
  public set forwardNotificationUC(forwardNotificationUC: ForwardNotificationUseCase) {
    this._ForwardNotificationUC = forwardNotificationUC;
  }
}
