import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
            <div className="text-red-500 text-6xl mb-4 flex justify-center">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Eyvah! Bir Şeyler Ters Gitti</h1>
            <p className="text-gray-600 mb-6">Uygulama beklenmedik bir hata ile karşılaştı. Lütfen sayfayı yenilemeyi deneyin.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-gray-100 rounded-lg text-left text-xs text-red-600 overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
