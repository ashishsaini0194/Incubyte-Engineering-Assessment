import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, DatePicker, Button, Space, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { updateEmployee, fetchDepartments } from '../services/api';
import { COUNTRIES, GENDERS, EMPLOYEE_STATUSES, DESIGNATIONS } from '@salary-sight/shared';
import type { Employee } from '@salary-sight/shared';
import dayjs from 'dayjs';

interface EditEmployeeDrawerProps {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditEmployeeDrawer: React.FC<EditEmployeeDrawerProps> = ({
  employee,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const selectedDepartment = Form.useWatch('departmentId', form);
  const deptName = departments?.find((d: any) => d.id === selectedDepartment)?.name;
  const designationOptions = deptName ? DESIGNATIONS[deptName] || [] : [];

  const mutation = useMutation({
    mutationFn: (data: any) => updateEmployee(employee.id, data),
    onSuccess: () => {
      message.success('Employee updated successfully');
      onSuccess();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.error || 'Failed to update');
    },
  });

  useEffect(() => {
    if (open && employee) {
      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        dateOfBirth: dayjs(employee.dateOfBirth),
        dateOfJoining: dayjs(employee.dateOfJoining),
        departmentId: employee.departmentId,
        designation: employee.designation,
        country: employee.country,
        city: employee.city,
        status: employee.status,
      });
    }
  }, [open, employee, form]);

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
    <Drawer
      title={`Edit — ${employee.firstName} ${employee.lastName}`}
      open={open}
      onClose={onClose}
      width={500}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={mutation.isPending}>
            Save
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select options={GENDERS.map((g) => ({ label: g, value: g }))} />
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="dateOfJoining" label="Date of Joining" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Select showSearch options={COUNTRIES.map((c) => ({ label: c, value: c }))} />
        </Form.Item>
        <Form.Item name="city" label="City">
          <Input />
        </Form.Item>
        <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
          <Select
            options={(departments || []).map((d: any) => ({
              label: d.name,
              value: d.id,
            }))}
          />
        </Form.Item>
        <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
          <Select
            showSearch
            options={designationOptions.map((d) => ({ label: d, value: d }))}
          />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={EMPLOYEE_STATUSES.map((s) => ({ label: s, value: s }))} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditEmployeeDrawer;
