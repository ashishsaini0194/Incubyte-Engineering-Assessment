import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Descriptions,
  Tag,
  Table,
  Button,
  Space,
  Typography,
  Card,
  Spin,
  message,
  Popconfirm,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEmployee, deleteEmployee, fetchSalaries } from '../services/api';
import { formatSalary, COUNTRY_CURRENCY_MAP } from '@salary-sight/shared';
import type { ColumnsType } from 'antd/es/table';
import EditEmployeeDrawer from '../components/EditEmployeeDrawer';
import AddSalaryModal from '../components/AddSalaryModal';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  TERMINATED: 'red',
};

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showAddSalary, setShowAddSalary] = useState(false);

  const employeeId = parseInt(id || '0', 10);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => fetchEmployee(employeeId),
    enabled: !!employeeId,
  });

  const { data: salaries, isLoading: salariesLoading } = useQuery({
    queryKey: ['salaries', employeeId],
    queryFn: () => fetchSalaries(employeeId),
    enabled: !!employeeId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEmployee(employeeId),
    onSuccess: () => {
      message.success('Employee terminated');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={4}>Employee not found</Title>
        <Button onClick={() => navigate('/employees')}>Go back</Button>
      </div>
    );
  }

  const countryInfo = COUNTRY_CURRENCY_MAP[employee.country];

  const salaryColumns: ColumnsType<any> = [
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      render: (date: string | null) =>
        date ? new Date(date).toLocaleDateString() : <Tag color="blue">Current</Tag>,
    },
    {
      title: 'Base Salary',
      dataIndex: 'baseSalary',
      align: 'right',
      render: (val: number) => formatSalary(val, employee.country),
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      align: 'right',
      render: (val: number) => formatSalary(val, employee.country),
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      align: 'right',
      render: (val: number) => formatSalary(val, employee.country),
    },
    {
      title: 'Net Salary',
      dataIndex: 'netSalary',
      align: 'right',
      render: (val: number) => (
        <Text strong>{formatSalary(val, employee.country)}</Text>
      ),
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      width: 80,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employees')}>
          Back
        </Button>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  {employee.firstName} {employee.lastName}
                </Title>
                <Tag color={statusColors[employee.status]}>{employee.status}</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setShowEditDrawer(true)}
                >
                  Edit
                </Button>
                {employee.status !== 'TERMINATED' && (
                  <Popconfirm
                    title="Terminate this employee?"
                    description="This will set their status to TERMINATED."
                    onConfirm={() => deleteMutation.mutate()}
                    okText="Yes, terminate"
                    okType="danger"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Terminate
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            }
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
              <Descriptions.Item label="Employee Code">
                <Text code>{employee.employeeCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{employee.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Department">
                {employee.department?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Designation">{employee.designation}</Descriptions.Item>
              <Descriptions.Item label="Gender">{employee.gender}</Descriptions.Item>
              <Descriptions.Item label="Country">{employee.country}</Descriptions.Item>
              <Descriptions.Item label="City">{employee.city || '—'}</Descriptions.Item>
              <Descriptions.Item label="Currency">
                {countryInfo ? `${countryInfo.currency} (${countryInfo.symbol})` : 'USD ($)'}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {new Date(employee.dateOfBirth).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Joining">
                {new Date(employee.dateOfJoining).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Current Salary">
                <Text strong style={{ fontSize: 16 }}>
                  {employee.currentSalary
                    ? formatSalary(employee.currentSalary.netSalary, employee.country)
                    : '—'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title="Salary History"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddSalary(true)}
              >
                Add Revision
              </Button>
            }
          >
            <Table
              columns={salaryColumns}
              dataSource={salaries || []}
              rowKey="id"
              loading={salariesLoading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <EditEmployeeDrawer
        employee={employee}
        open={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        onSuccess={() => {
          setShowEditDrawer(false);
          queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
          queryClient.invalidateQueries({ queryKey: ['employees'] });
        }}
      />

      <AddSalaryModal
        employeeId={employeeId}
        country={employee.country}
        open={showAddSalary}
        onClose={() => setShowAddSalary(false)}
        onSuccess={() => {
          setShowAddSalary(false);
          queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
          queryClient.invalidateQueries({ queryKey: ['salaries', employeeId] });
        }}
      />
    </div>
  );
};

export default EmployeeDetail;
