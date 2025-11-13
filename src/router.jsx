import { createBrowserRouter } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ChatBot } from './pages/ChatBot';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Register } from './pages/Register';
import TicketList from './pages/TicketList';
import UserHelp from './pages/UserHelp';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminUsers from './pages/admin/Users';
import AdminTickets from './pages/admin/Tickets';
import AdminReports from './pages/admin/Reports';

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { 
    path: "/home", 
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  { 
    path: "/chat", 
    element: (
      <ProtectedRoute>
        <ChatBot />
      </ProtectedRoute>
    )
  },
  { 
    path: "/knowledge-base", 
    element: (
      <ProtectedRoute requireManager={true}>
        <KnowledgeBase />
      </ProtectedRoute>
    )
  },
  { 
    path: "/tickets", 
    element: (
      <ProtectedRoute>
        <TicketList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requireManager={true}>
        <AdminUsers />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/tickets",
    element: (
      <ProtectedRoute requireManager={true}>
        <AdminTickets />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute requireManager={true}>
        <AdminReports />
      </ProtectedRoute>
    )
  },
  {
    path: "/artigos", 
    element: (
      <ProtectedRoute>
        <UserHelp />
      </ProtectedRoute>
    )
  },
  { path: "*", element: <Login /> },
]);
