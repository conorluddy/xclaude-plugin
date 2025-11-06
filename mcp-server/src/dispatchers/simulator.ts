/**
 * Simulator Dispatcher
 *
 * Consolidates all simctl operations into a single tool.
 * Token cost: ~400 tokens (vs ~5k for 9 separate tools)
 *
 * Operations: device-lifecycle, app-lifecycle, io, push, openurl, list, health-check
 */

import { BaseDispatcher } from './base.js';
import { logger } from '../utils/logger.js';
import type {
  ToolDefinition,
  SimulatorOperationArgs,
  SimulatorResultData,
  OperationResult,
  DeviceLifecycleParams,
  AppLifecycleParams,
  IOParams,
  PushParams,
  OpenURLParams,
  GetAppContainerParams,
  DeviceLifecycleResultData,
  AppLifecycleResultData,
  ListResultData,
  HealthCheckResultData,
  SimulatorParameters,
} from '../types.js';

export class SimulatorDispatcher extends BaseDispatcher<
  SimulatorOperationArgs,
  SimulatorResultData
> {
  getToolDefinition(): ToolDefinition {
    return {
      name: 'execute_simulator_command',
      description:
        'Control iOS Simulator devices and apps. Use simulator-workflows Skill for device management guidance.',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: [
              'device-lifecycle',
              'app-lifecycle',
              'io',
              'push',
              'openurl',
              'list',
              'health-check',
              'get-app-container',
            ],
            description:
              'Operation category: device-lifecycle (boot/shutdown/create/delete), app-lifecycle (install/launch/terminate), io (screenshot/video), push (notifications), openurl, list (devices), health-check (validate environment), get-app-container (app paths)',
          },
          device_id: {
            type: 'string',
            description: 'Device UDID or name (e.g. "iPhone 15" or full UDID)',
          },
          sub_operation: {
            type: 'string',
            description:
              'Specific action within operation: boot, shutdown, create, delete, erase, clone, install, uninstall, launch, terminate, screenshot, video',
          },
          app_identifier: {
            type: 'string',
            description: 'App bundle identifier (e.g. "com.example.MyApp")',
          },
          parameters: {
            type: 'object',
            description:
              'Operation-specific parameters (device_type, runtime, app_path, url, etc.)',
          },
        },
        required: ['operation'],
      },
    };
  }

  async execute(args: SimulatorOperationArgs): Promise<OperationResult<SimulatorResultData>> {
    const { operation, device_id, sub_operation, app_identifier, parameters } = args;

    logger.info(`Executing simulator operation: ${operation} / ${sub_operation || 'default'}`);

    try {
      switch (operation) {
        case 'device-lifecycle':
          if (!sub_operation) {
            return this.formatError('sub_operation required for device-lifecycle', operation);
          }
          return await this.executeDeviceLifecycle({
            device_id,
            sub_operation: sub_operation as never,
            parameters,
          });

        case 'app-lifecycle':
          if (!sub_operation || !app_identifier) {
            return this.formatError(
              'sub_operation and app_identifier required for app-lifecycle',
              operation
            );
          }
          return await this.executeAppLifecycle({
            device_id,
            app_identifier,
            sub_operation: sub_operation as never,
            parameters,
          });

        case 'io':
          if (!sub_operation) {
            return this.formatError('sub_operation required for io', operation);
          }
          return await this.executeIO({
            device_id,
            sub_operation: sub_operation as never,
            parameters,
          });

        case 'push':
          if (!app_identifier) {
            return this.formatError('app_identifier required for push', operation);
          }
          return await this.executePush({
            device_id,
            app_identifier,
            parameters,
          });

        case 'openurl':
          if (!parameters?.url) {
            return this.formatError('url required in parameters for openurl', operation);
          }
          return await this.executeOpenURL({
            device_id,
            parameters: { url: parameters.url },
          });

        case 'list':
          return await this.executeList(parameters);

        case 'health-check':
          return await this.executeHealthCheck();

        case 'get-app-container':
          if (!device_id || !app_identifier) {
            return this.formatError(
              'device_id and app_identifier required for get-app-container',
              operation
            );
          }
          return await this.executeGetAppContainer({
            device_id,
            app_identifier,
            parameters,
          });

        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`Simulator operation failed: ${operation}`, error as Error);
      return this.formatError(error as Error, operation);
    }
  }

  private async executeDeviceLifecycle(
    params: Partial<DeviceLifecycleParams>
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder - will implement with xc-mcp simctl logic
    const data: DeviceLifecycleResultData = {
      message: 'Device lifecycle operation not yet implemented',
      sub_operation: (params.sub_operation || '') as never,
      note: 'Will use xc-mcp simctl-device router logic',
      params: params as DeviceLifecycleParams,
    };
    return this.formatSuccess(data);
  }

  private async executeAppLifecycle(
    params: Partial<AppLifecycleParams>
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder
    const data: AppLifecycleResultData = {
      message: 'App lifecycle operation not yet implemented',
      sub_operation: (params.sub_operation || '') as never,
      params: params as AppLifecycleParams,
    };
    return this.formatSuccess(data);
  }

  private async executeIO(
    params: Partial<IOParams>
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder - IO returns device lifecycle style data
    const data: DeviceLifecycleResultData = {
      message: 'IO operation not yet implemented',
      sub_operation: (params.sub_operation || '') as never,
      params: params as never,
    };
    return this.formatSuccess(data);
  }

  private async executePush(
    params: Partial<PushParams>
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder
    const data: AppLifecycleResultData = {
      message: 'Push notification operation not yet implemented',
      sub_operation: 'install',
      params: params as never,
    };
    return this.formatSuccess(data);
  }

  private async executeOpenURL(
    params: Partial<OpenURLParams>
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder
    const data: AppLifecycleResultData = {
      message: 'OpenURL operation not yet implemented',
      sub_operation: 'launch',
      params: params as never,
    };
    return this.formatSuccess(data);
  }

  private async executeList(
    _params?: SimulatorParameters
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder
    const data: ListResultData = {
      message: 'List operation not yet implemented',
      note: 'Will use progressive disclosure with cache IDs',
    };
    return this.formatSuccess(data);
  }

  private async executeHealthCheck(): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder
    const data: HealthCheckResultData = {
      message: 'Health check not yet implemented',
      note: 'Will validate Xcode installation and simctl availability',
    };
    return this.formatSuccess(data);
  }

  private async executeGetAppContainer(
    params: Partial<GetAppContainerParams>
  ): Promise<OperationResult<SimulatorResultData>> {
    // Placeholder
    const data: AppLifecycleResultData = {
      message: 'Get app container operation not yet implemented',
      sub_operation: 'install',
      params: params as never,
    };
    return this.formatSuccess(data);
  }
}
