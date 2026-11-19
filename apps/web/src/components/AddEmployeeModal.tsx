import React from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col, message, Divider } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createEmployee, fetchDepartments } from '../services/api';
import { COUNTRIES, GENDERS, DESIGNATIONS, getCurrencyForCountry, COUNTRY_CURRENCY_MAP } from '@salary-sight/shared';
import dayjs from 'dayjs';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      message.success('Employee created successfully');
      form.resetFields();
      onSuccess();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error || 'Failed to create employee');
    },
  });

  const selectedCountry = Form.useWatch('country', form);
  const selectedDepartment = Form.useWatch('departmentId', form);

  const deptName = departments?.find((d: any) => d.id === selectedDepartment)?.name;
  const designationOptions = deptName ? DESIGNATIONS[deptName] || [] : [];
  const currencyInfo = selectedCountry ? COUNTRY_CURRENCY_MAP[selectedCountry] : null;

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      mutation.mutate({
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),
      });
    });
  };

  return (
    <Modal
      title="Add New Employee"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      width={700}
      okText="Create"
      confirmLoading={mutation.isPending}
    >
      <Form form={form} layout="vertical" initialValues={{ gender: 'MALE', bonus: 0, deductions: 0 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select options={GENDERS.map((g) => ({ label: g, value: g }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} disabledDate={(d) => d.isAfter(dayjs())} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dateOfJoining" label="Date of Joining" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="country" label="Country" rules={[{ required: true }]}>
              <Select
                showSearch
                options={COUNTRIES.map((c) => ({ label: c, value: c }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
              <Select
                options={(departments || []).map((d: any) => ({
                  label: d.name,
                  value: d.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
              <Select
                showSearch
                options={designationOptions.map((d) => ({ label: d, value: d }))}
                disabled={!selectedDepartment}
                placeholder={selectedDepartment ? 'Select...' : 'Select department first'}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="city" label="City">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Currency">
              <Input
                value={currencyInfo ? `${currencyInfo.currency} (${currencyInfo.symbol})` : 'Select country...'}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Salary</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="baseSalary"
              label={`Base Salary${currencyInfo ? ` (${currencyInfo.currency})` : ''}`}
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={1000} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bonus" label="Bonus">
              <InputNumber style={{ width: '100%' }} min={0} step={500} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="deductions" label="Deductions">
              <InputNumber style={{ width: '100%' }} min={0} step={500} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddEmployeeModal;
