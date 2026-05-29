export const WORKFLOW_STEPS = [
  {
    id: 'raw-message',
    label: '原始消息',
  },
  {
    id: 'extracted',
    label: '已提取',
  },
  {
    id: 'pending',
    label: '待确认',
  },
  {
    id: 'confirmed',
    label: '已确认',
  },
  {
    id: 'reminded',
    label: '已提醒',
  },
];

export const EVENT_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  dismissed: 'dismissed',
};
