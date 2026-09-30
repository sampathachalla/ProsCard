import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { ScannerService } from '../services/scanner.service.js';
import { readCardRequestSchema } from '../utils/scanner.schemas.js';

export class ScannerController {
  constructor(private readonly service: ScannerService) {}

  read = async (request: AuthenticatedRequest, response: Response) =>
    response.json(await this.service.readCard(readCardRequestSchema.parse(request.body)));
}
