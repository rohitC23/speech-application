import React, { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import Header from './Header';

function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://communication.theknowhub.com/api/admin/get/score');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError('Data fetch failed. Server is temporarily unavailable. Please retry shortly.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process user data for table display
  const selectedUserData = useMemo(() => {
    if (!selectedUser) return [];
    const user = users.find((user) => user.user_name === selectedUser);
    if (!user) return [];
    const rows = [];
    Object.keys(user)
      .filter((key) => key.match(/^\d{4}-\d{2}-\d{2}$/)) // Match date keys
      .forEach((date) => {
        Object.entries(user[date]).forEach(([level, attempts]) => {
          Object.entries(attempts).forEach(([attempt, details]) => {
            rows.push({
              date,
              level,
              attempt,
              score: details.score,
              duration: details.duration,
            });
          });
        });
      });
    return rows;
  }, [users, selectedUser]);

  const columns = useMemo(
    () => [
      { Header: 'Date', accessor: 'date' },
      { Header: 'Level', accessor: 'level' },
      { Header: 'Attempt', accessor: 'attempt' },
      { Header: 'Score', accessor: 'score' },
      { Header: 'Duration (HH:mm:ss)', accessor: 'duration' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: selectedUserData });

  // Transform options for react-select
  const userOptions = users
    .slice()
    .sort((a, b) => a.user_name.localeCompare(b.user_name))
    .map(user => ({ value: user.user_name, label: user.user_name }));

  // Custom styles for react-select
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure the dropdown appears above other components
      maxHeight: '200px', // Limit the height of the menu to enable scrolling
      overflowY: 'auto', // Make it scrollable
    }),
  };

  return (
    <div className="flex flex-col items-center relative min-h-screen bg-gray-100 p-4 pt-20">
      {/* Header component */}
      <Header showNav={true} />

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-700 mt-8 mb-4">Admin Dashboard</h1>

      {/* User dropdown */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col items-center w-full max-w-xl mb-4">
          <Select
            value={userOptions.find(option => option.value === selectedUser)}
            onChange={option => setSelectedUser(option ? option.value : null)}
            options={userOptions}
            placeholder="Select a user"
            className="w-full"
            classNamePrefix="react-select"
            styles={customStyles} // Apply custom styles
          />
        </div>
      )}

      {/* Table section */}
      {selectedUserData.length > 0 && (
        <div className="overflow-auto mt-6 w-full max-w-5xl" style={{ maxHeight: '400px' }}>
          {/* Set a max height on the parent div for scrolling */}
          <table {...getTableProps()} className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="bg-blue-50 text-gray-700 uppercase text-sm">
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="sticky top-0 px-4 py-3 border-b text-left bg-blue-50"
                      style={{ zIndex: 1 }} // Ensure header stays in front
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-blue-50 transition-colors">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="px-4 py-2 border-b">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
