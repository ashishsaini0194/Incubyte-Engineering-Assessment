import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
  ];

  const selectedKey = location.pathname.startsWith('/employees') ? '/employees' : '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: '#001529',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            SalarySight
          </Title>
        </div>
      </Header>
      <Layout>
        <Sider width={200} theme="light" breakpoint="lg" collapsedWidth={0}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 8,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
