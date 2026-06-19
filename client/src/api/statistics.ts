import request from './request';
import type { StatisticsData } from '../types/statistics';

export const getStatistics = (): Promise<StatisticsData> => {
  return request.get('/statistics');
};
