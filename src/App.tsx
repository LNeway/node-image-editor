import { Provider } from 'react-redux';
import { store } from './store';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );
}

export default App;
