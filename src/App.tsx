import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { store } from './store';
import i18n from './i18n';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <AppLayout />
      </I18nextProvider>
    </Provider>
  );
}

export default App;