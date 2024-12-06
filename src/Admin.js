import React, { useState, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import Header from './Header';

function Admin() {
  const [userName, setUserName] = useState('');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://communication.theknowhub.com/api/admin/get/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_fullname: userName }),
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setScores(data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    { Header: 'Date', accessor: 'date' },
    { Header: 'Level', accessor: 'level' },
    { Header: 'Attempt', accessor: 'attempt' },
    { Header: 'Score', accessor: 'score' },
    { Header: 'Duration (HH:mm:ss)', accessor: 'duration' },
  ], []);

  const data = useMemo(() => scores, [scores]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <div className="flex flex-col items-center relative min-h-screen bg-gray-100 p-4 pt-20">
      {/* Header component */}
      <Header showNav={true} />

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-700 mt-8 mb-4">Admin Dashboard</h1>

      {/* Search bar section with side-by-side alignment */}
      <div className="flex flex-col items-center w-full max-w-lg">
        <div className="flex items-center space-x-2 w-full">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter User Full Name"
            className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Table section */}
      {scores.length > 0 && (
        <div className="overflow-x-auto mt-6 w-full max-w-5xl">
          <div className="max-h-96 overflow-y-auto shadow-lg rounded-lg">
            <table {...getTableProps()} className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              {headerGroups.map(headerGroup => {
                const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps(); // Destructure key
                return (
                  <tr
                    key={key} // Use the destructured key
                    {...restHeaderGroupProps} // Spread the remaining props
                    className="bg-blue-50 text-gray-700 uppercase text-sm leading-normal"
                  >
                    {headerGroup.headers.map(column => {
                      const { key: columnKey, ...restColumnProps } = column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        <th
                          key={columnKey} // Use the destructured key
                          {...restColumnProps} // Spread the remaining props
                          className="px-4 py-3 border-b text-left cursor-pointer"
                        >
                          {column.render('Header')}
                          <span>
                            {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                const { key: rowKey, ...restRowProps } = row.getRowProps(); // Destructure key from row props
                return (
                  <tr
                    key={rowKey} // Use the destructured key
                    {...restRowProps} // Spread the remaining props
                    className="hover:bg-blue-50 transition-colors"
                  >
                    {row.cells.map(cell => {
                      const { key: cellKey, ...restCellProps } = cell.getCellProps(); // Destructure key from cell props
                      return (
                        <td
                          key={cellKey} // Use the destructured key
                          {...restCellProps} // Spread the remaining props
                          className="px-4 py-2 border-b"
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
