import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  Space,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, fetchDepartments } from '../services/api';
import { COUNTRIES, EMPLOYEE_STATUSES, formatSalary } from '@salary-sight/shared';
import type { EmployeeFilters } from '@salary-sight/shared';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import AddEmployeeModal from '../components/AddEmployeeModal';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  TERMINATED: 'red',
};

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EmployeeFilters>({
    page: 1,
    limit: 25,
    sortBy: 'firstName',
    sortOrder: 'asc',
  });
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => fetchEmployees(filters),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
  ) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setFilters((prev) => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 25,
      ...(singleSorter.field
        ? {
            sortBy: singleSorter.field as string,
            sortOrder: singleSorter.order === 'descend' ? 'desc' : 'asc',
          }
        : {}),
    }));
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleExportCSV = () => {
    if (!data?.data?.length) {
      message.warning('No data to export');
      return;
    }

    const headers = [
      'Employee Code',
      'First Name',
      'Last Name',
      'Email',
      'Department',
      'Designation',
      'Country',
      'Status',
      'Date of Joining',
      'Salary',
      'Currency',
    ];

    const rows = data.data.map((emp: any) => [
      emp.employeeCode,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.department?.name || '',
      emp.designation,
      emp.country,
      emp.status,
      new Date(emp.dateOfJoining).toLocaleDateString(),
      emp.currentSalary?.netSalary || '',
      emp.currentSalary?.currency || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('CSV exported successfully');
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Code',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 120,
      render: (code: string) => <span style={{ fontFamily: 'monospace' }}>{code}</span>,
    },
    {
      title: 'Name',
      key: 'firstName',
      sorter: true,
      render: (_: any, record: any) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'Department',
      key: 'department',
      sorter: true,
      render: (_: any, record: any) => record.department?.name || '—',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: true,
    },
    {
      title: 'Salary',
      key: 'salary',
      align: 'right',
      render: (_: any, record: any) => {
        const salary = record.currentSalary;
        if (!salary) return '—';
        return formatSalary(salary.netSalary, record.country);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Tooltip title="View Details">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/employees/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Employees
          </Title>
          <span style={{ color: '#888' }}>
            {data?.pagination?.total
              ? `${data.pagination.total.toLocaleString()} total employees`
              : ''}
          </span>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
            >
              Add Employee
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search name, email, code..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Department"
              allowClear
              style={{ width: '100%' }}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, department: val || undefined, page: 1 }))
              }
              options={(departments || []).map((d: any) => ({
                label: d.name,
                value: d.name,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Country"
              allowClear
              style={{ width: '100%' }}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, country: val || undefined, page: 1 }))
              }
              options={COUNTRIES.map((c) => ({ label: c, value: c }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, status: val || undefined, page: 1 }))
              }
              options={EMPLOYEE_STATUSES.map((s) => ({ label: s, value: s }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total: data?.pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          pageSizeOptions: ['10', '25', '50', '100'],
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          refetch();
        }}
      />
    </div>
  );
};

export default EmployeeList;
