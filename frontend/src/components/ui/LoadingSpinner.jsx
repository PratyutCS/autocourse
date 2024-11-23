const LoadingSpinner = () => (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center">
      {/* Simple, elegant spinner */}
      <div className="w-12 h-12 rounded-full animate-spin relative">
        <div 
          className="absolute inset-0 border-4 border-[#FFB255] rounded-full animate-spin" 
          style={{ 
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            animationDuration: '0.8s'
          }}
        ></div>
      </div>
      
      {/* Loading text with subtle animation */}
      <div className="mt-4 text-gray-600 text-sm font-medium tracking-wide opacity-80">
        Loading...
      </div>
    </div>
  );
  export default LoadingSpinner;