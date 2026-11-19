import React from 'react';
import { Modal, Form, InputNumber, DatePicker, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { createSalary } from '../services/api';
import { COUNTRY_CURRENCY_MAP } from '@salary-sight/shared';

interface AddSalaryModalProps {
  employeeId: number;
  country: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSalaryModal: React.FC<AddSalaryModalProps> = ({
  employeeId,
  country,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const countryInfo = COUNTRY_CURRENCY_MAP[country];
  const currencyLabel = countryInfo ? `${countryInfo.currency} (${countryInfo.symbol})` : 'USD ($)';

  const mutation = useMutation({
    mutationFn: (data: any) => createSalary(employeeId, data),
    onSuccess: () => {
      message.success('Salary revision added');
      form.resetFields();
      onSuccess();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error || 'Failed to add salary');
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      mutation.mutate({
        ...values,
        effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
      });
    });
  };

  return (
    <Modal
      title="Add Salary Revision"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Add"
      confirmLoading={mutation.isPending}
    >
      <Form form={form} layout="vertical" initialValues={{ bonus: 0, deductions: 0 }}>
        <Form.Item
          name="baseSalary"
          label={`Base Salary (${currencyLabel})`}
          rules={[{ required: true, type: 'number', min: 1 }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} step={1000} />
        </Form.Item>
        <Form.Item name="bonus" label={`Bonus (${currencyLabel})`}>
          <InputNumber style={{ width: '100%' }} min={0} step={500} />
        </Form.Item>
        <Form.Item name="deductions" label={`Deductions (${currencyLabel})`}>
          <InputNumber style={{ width: '100%' }} min={0} step={500} />
        </Form.Item>
        <Form.Item
          name="effectiveDate"
          label="Effective Date"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} placeholder="Reason for revision..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSalaryModal;
