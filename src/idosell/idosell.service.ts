import { IdosellOrder, idosellRepository } from "./idosell.repository";

export interface IdosellService {
  getOrders(): Promise<IdosellOrder[]>;
}

export class IdosellServiceImpl implements IdosellService {
  getOrders(): Promise<IdosellOrder[]> {
    return idosellRepository.fetchOrders();
  }
}

// Singleton instance
export const idosellService = new IdosellServiceImpl();
