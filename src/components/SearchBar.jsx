import React from 'react';

export default function SearchBar({ searchValue, setSearchValue }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <input
        type="text"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        placeholder="Поиск запчастей..."
        className="w-full border border-gray-300 rounded-full px-4 py-2 focus:border-blue-600 focus:ring focus:ring-blue-200"
      />
    </div>
  );
}
