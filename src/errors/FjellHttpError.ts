/**
 * ErrorInfo type from @fjell/core
 * Re-exported for convenience
 */
export interface ErrorInfo {
  code: string;
  message: string;
  operation: {
    type: 'get' | 'create' | 'update' | 'remove' | 'upsert' |
          'all' | 'one' | 'find' | 'findOne' |
          'action' | 'allAction' | 'facet' | 'allFacet';
    name: string;
    params: Record<string, any>;
  };
  context: {
    itemType: string;
    key?: {
      primary?: string | number;
      composite?: {
        sk: string | number;
        kta: string[];
        locations?: Array<{ lk: string | number; kt: string }>;
      };
    };
    affectedItems?: Array<{
      id: string | number;
      type: string;
      displayName?: string;
    }>;
    parentLocation?: {
      id: string | number;
      type: string;
    };
    requiredPermission?: string;
    availablePermissions?: string[];
  };
  details?: {
    validOptions?: string[];
    suggestedAction?: string;
    retryable?: boolean;
    conflictingValue?: any;
    expectedValue?: any;
  };
  technical?: {
    timestamp: string;
    requestId?: string;
    stackTrace?: string;
    cause?: any;
  };
}

/**
 * HTTP error that preserves Fjell error information from server responses
 */
export class FjellHttpError extends Error {
  public readonly name = 'FjellHttpError';
  
  constructor(
    message: string,
    public readonly fjellError: ErrorInfo,
    public readonly httpResponseCode: number,
    public readonly requestInfo?: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: any;
    }
  ) {
    super(message);
    
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, FjellHttpError.prototype);
  }

  /**
   * Get a user-friendly error message with context
   */
  getUserMessage(): string {
    let message = this.fjellError.message;

    // Add context information
    if (this.fjellError.context?.parentLocation) {
      const loc = this.fjellError.context.parentLocation;
      message += ` (in ${loc.type} #${loc.id})`;
    }

    // Add suggestions
    if (this.fjellError.details?.suggestedAction) {
      message += `\n${this.fjellError.details.suggestedAction}`;
    }

    // Add valid options
    if (this.fjellError.details?.validOptions?.length) {
      message += `\nValid options: ${this.fjellError.details.validOptions.join(', ')}`;
    }

    return message;
  }

  /**
   * Check if the error is retryable
   */
  isRetryable(): boolean {
    return this.fjellError.details?.retryable ?? false;
  }

  /**
   * Get the error code
   */
  getCode(): string {
    return this.fjellError.code;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      fjellError: this.fjellError,
      httpResponseCode: this.httpResponseCode,
      requestInfo: this.requestInfo
    };
  }
}

/**
 * Type guard to check if an error is a FjellHttpError
 */
export function isFjellHttpError(error: any): error is FjellHttpError {
  return error instanceof FjellHttpError;
}

/**
 * Helper to extract error info from various error types
 */
export function extractErrorInfo(error: any): ErrorInfo | null {
  if (isFjellHttpError(error)) {
    return error.fjellError;
  }
  
  if (error?.fjellError && typeof error.fjellError === 'object') {
    return error.fjellError;
  }
  
  return null;
}

