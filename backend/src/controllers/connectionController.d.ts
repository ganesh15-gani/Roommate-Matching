import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const sendRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const respondRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRequests: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=connectionController.d.ts.map