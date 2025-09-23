import { Response } from "express";
import { ZodError } from "zod";

export interface ApiError {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiError | ApiSuccess<T>;

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleZodError(error: ZodError): ApiError {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return {
    success: false,
    error: "Dados inválidos",
    details,
    statusCode: 400
  };
}

export function handleDatabaseError(error: any): ApiError {
  console.error("Database Error:", error);

  // Violação de constraint única
  if (error.code === '23505') {
    return {
      success: false,
      error: "Já existe um registro com esses dados únicos",
      statusCode: 409
    };
  }

  // Violação de chave estrangeira
  if (error.code === '23503') {
    return {
      success: false,
      error: "Referência inválida - verifique os dados relacionados",
      statusCode: 400
    };
  }

  // Violação de constraint not null
  if (error.code === '23502') {
    return {
      success: false,
      error: "Campo obrigatório não informado",
      statusCode: 400
    };
  }

  // Erro de conexão com banco
  if (error.message?.includes('endpoint has been disabled')) {
    return {
      success: false,
      error: "Banco de dados temporariamente indisponível",
      statusCode: 503
    };
  }

  return {
    success: false,
    error: "Erro interno do servidor",
    statusCode: 500
  };
}

export function handleError(error: any, res: Response) {
  console.error("API Error:", error);

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }

  // Erro de validação Zod
  if (error instanceof ZodError) {
    const apiError = handleZodError(error);
    return res.status(apiError.statusCode).json(apiError);
  }

  // Erro de banco de dados
  if (error.code || error.message?.includes('database') || error.message?.includes('endpoint')) {
    const apiError = handleDatabaseError(error);
    return res.status(apiError.statusCode).json(apiError);
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: "Erro interno do servidor"
  });
}

export function successResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data
  };
}

export function errorResponse(message: string, statusCode: number = 500): ApiError {
  return {
    success: false,
    error: message,
    statusCode
  };
}