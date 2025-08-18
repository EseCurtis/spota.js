import schedule from 'node-schedule';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Enum for HTTP methods
enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

// Type definitions
interface SpotaRequestPayload {
  method: RequestMethods;
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  [key: string]: unknown; // Allow additional Axios config properties
}

interface SpotaScheduleConfig {
  rule?: schedule.RecurrenceRule | string; // Support cron strings or RecurrenceRule
  callbackUrl?: string;
}




interface SpotaResponse<T = any> extends AxiosResponse<T> { }

// Request builder with chainable schedule method
class SpotaRequest {
  private payload: SpotaRequestPayload;
  private schedulerApiUrl: string;

  constructor(payload: SpotaRequestPayload, schedulerApiUrl: string) {
    this.payload = payload;
    this.schedulerApiUrl = schedulerApiUrl;
  }

  async schedule<T = any>(config: SpotaScheduleConfig = {}): Promise<SpotaResponse<T>> {
    // Validate payload
    if (!this.payload.url) {
      throw new Error('Request URL is required');
    }
    if (!Object.values(RequestMethods).includes(this.payload.method)) {
      throw new Error(`Invalid HTTP method: ${this.payload.method}`);
    }

    // If no rule, execute immediately
    if (!config.rule) {
      try {

        const response = await axios({
          ...this.payload,
          method: this.payload.method,
          url: this.payload.url,
          headers: this.payload.headers,
          data: this.payload.data,
        });
        return response;
      } catch (error: any) {
        throw new Error(`Immediate request failed: ${error.message}`);
      }
    }

    // Schedule the request
    try {
      const response = await axios.post<SpotaResponse<T>>(this.schedulerApiUrl, {
        rule: typeof config.rule === 'string' ? config.rule : config.rule,
        request: this.payload,
        callbackUrl: config.callbackUrl,
      });
      return response as any;
    } catch (error: any) {
      throw new Error(`Failed to schedule request: ${error.message}`);
    }
  }

  // Immediate execution when called directly
  async execute<T = any>(): Promise<SpotaResponse<T>> {
    return this.schedule<T>({});
  }
}

// Spota client
class Spota {
  private schedulerApiUrl: string;

  constructor(schedulerApiUrl: string = 'http://localhost:3001/api/scheduler') {
    this.schedulerApiUrl = process.env.SPOTA_SCHEDULER_URL || schedulerApiUrl;
  }

  // Helper to create recurrence rule
  static reoccurence(ruleInfo: Partial<schedule.RecurrenceRule> | string): schedule.RecurrenceRule | string {
    return (typeof ruleInfo === 'string' ? ruleInfo : (() => {
      const rule = new schedule.RecurrenceRule();
      if (ruleInfo.year) rule.year = ruleInfo.year;
      if (ruleInfo.month) rule.month = ruleInfo.month;
      if (ruleInfo.date) rule.date = ruleInfo.date;
      if (ruleInfo.dayOfWeek) rule.dayOfWeek = ruleInfo.dayOfWeek;
      if (ruleInfo.hour) rule.hour = ruleInfo.hour;
      if (ruleInfo.minute) rule.minute = ruleInfo.minute;
      if (ruleInfo.second) rule.second = ruleInfo.second;
      if (ruleInfo.tz) rule.tz = ruleInfo.tz;

      console.log(rule)
      return rule;
    })()) as any;
  }

  // HTTP method factory
  private createMethod(method: RequestMethods, hasBody: boolean = false) {
    return (url: string, data?: unknown, config: AxiosRequestConfig = {}): SpotaRequest => {
      if (!url) throw new Error('URL is required');

      const payload: SpotaRequestPayload = {
        ...config,
        url,
        method,
        headers: (config.headers || {}) as any,
        ...(hasBody && data !== undefined ? { data } : {}),
        ...(hasBody && config.data !== undefined ? { data: config.data } : {}),
      };

      return new SpotaRequest(payload, this.schedulerApiUrl);
    };
  }

  static schedule = schedule;

  // HTTP methods
  public get = this.createMethod(RequestMethods.GET);
  public post = this.createMethod(RequestMethods.POST, true);
  public put = this.createMethod(RequestMethods.PUT, true);
  public patch = this.createMethod(RequestMethods.PATCH, true);
  public del = this.createMethod(RequestMethods.DELETE, true);
  public head = this.createMethod(RequestMethods.HEAD);
  public options = this.createMethod(RequestMethods.OPTIONS);
}

// Export singleton instance and utilities
const spota = new Spota();
export { spota, Spota, RequestMethods, SpotaRequestPayload, SpotaScheduleConfig, SpotaRequest };


spota.get("https://google.com").schedule({
  rule: Spota.reoccurence({ hour: 0, minute: 0, second: 0, tz: "EST/X" })
}).then(() => {
  console.log("scheduled")
})