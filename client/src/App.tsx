import { Route, Switch } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Feed from "@/pages/Feed";
import Kanban from "@/pages/Kanban";
import Compass from "@/pages/Compass";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import AuthLayout from "@/components/layouts/AuthLayout";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      
      <Route path="/">
        <AuthLayout>
          <Dashboard />
        </AuthLayout>
      </Route>
      
      <Route path="/feed">
        <AuthLayout>
          <Feed />
        </AuthLayout>
      </Route>
      
      <Route path="/kanban">
        <AuthLayout>
          <Kanban />
        </AuthLayout>
      </Route>
      
      <Route path="/compass">
        <AuthLayout>
          <Compass />
        </AuthLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
