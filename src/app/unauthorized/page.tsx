export default async function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-red-600 mb-4'>Unauthorized Access</h1>
        <p className='text-lg text-gray-700 mb-6'>
          You do not have permission to access this page.
        </p>
        <a
          href='/login'
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
        >
          Return to Login
        </a>
      </div>
    </div>
  );
}
