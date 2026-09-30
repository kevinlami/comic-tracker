import { BadRequestException } from '@nestjs/common';
import { ReadingStatus } from '../generated/enums';

const VALID_READING_STATUSES = new Set(Object.values(ReadingStatus));

/**
 * Valida um valor de ReadingStatus recebido pela API.
 *
 * `undefined` (campo ausente) é aceito; `null` e valores desconhecidos são
 * rejeitados, pois a coluna `status` no banco é obrigatória.
 */
export function validateReadingStatus(status: unknown): void {
  if (status === undefined) {
    return;
  }

  if (
    typeof status !== 'string' ||
    !VALID_READING_STATUSES.has(status as ReadingStatus)
  ) {
    throw new BadRequestException(
      `Invalid status. Allowed values: ${Object.values(ReadingStatus).join(', ')}`,
    );
  }
}
