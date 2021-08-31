import React, {
  useState,
  useEffect,
  useCallback,
  Fragment,
  useMemo,
  useRef,
} from "react";
import Table from "./component/table";
import "./App.css";
import _ from "lodash";
import moment from "moment";
import axios from 'axios'
import { matchSorter } from 'match-sorter'
// import "tailwindcss/tailwind.css"

function App() {
  const [pageCount, setPageCount] = useState(0);
  const [data, setData] = useState([]);
  const [priority, setPriority] = useState(["high", "mid", "low"])
  const [label, setLabel] = (useState(["electrical", "mechanical", "plumbing", "lanscape"]))
  const fetchIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchAPIData = async ({ pageIndex, pageSize, search, priority, label }) => {
    try {
      setLoading(true);
      // const response = await fetch(
      //   `localhost:8080/api/issue?priority=${priority}&label=$label{label}&pageNumber=${pageIndex}&pageSize=${pageSize}`
      // );
      const response = await axios.get(`http://localhost:8080/api/issue?priority=${priority}&label=${label}&pageNumber=${pageIndex}&pageSize=${pageSize}`)
      console.log(response)
      console.log(response.data.data)
      const pages = parseInt(parseInt(response.data.pages)/parseInt(5))
      console.log(pages)

      setData(response.data.data);

      setPageCount(pages);
      setLoading(false);
    } catch (e) {
      console.log("Error while fetching", e);
      // setLoading(false)
    }
  };

  const fetchData = useCallback(
    ({ pageSize, pageIndex }) => {
      console.log(pageSize, pageIndex)
      // console.log("fetchData is being called")
      // This will get called when the table needs new data
      // You could fetch your data from literally anywhere,
      // even a server. But for this example, we'll just fake it.
      // Give this fetch an ID
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      if (fetchId === fetchIdRef.current) {
        fetchAPIData({
          pageIndex,
          pageSize,
          search: searchTerm,
          priority,
          label
        });
      }
    },
    [searchTerm]
  );

  const _handleSearch = _.debounce(
    (search) => {
      setSearchTerm(search);
    },
    1500,
    {
      maxWait: 1500,
    }
  );

  const columns = useMemo(() => [
    { 
      Header: "Title", 
      accessor: (d) => d.title, 
      show: true,
      filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, {
            keys: ["title"],
          }),
      filterAll: true,
    },
    { 
      Header: "Priority", 
      accessor: (d) => d.priority, 
      show: true,
      filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, {
            keys: ["priority"],
          }),
      filterAll: true,
    },
    { 
      Header: "Label", 
      accessor: (d) => d.label.map(text => <p>{text}</p>), 
      show: true,
      filterMethod: (filter, rows) => {console.log(filter, rows)},
      // Filter: SelectColumnFilter,
      filterAll: true,
    }
  ]);

  return (
    <div className="container mx-auto flex flex-col">
      <div className="flex justify-left">
        <input
          id="searchTerm"
          name="searchTerm"
          type="text"
          onChange={(e) => _handleSearch(e.target.value)}
          placeholder="Search By Ticket"
          className="w-auto h-full rounded p-2"
        />
        <button className="bg-white w-auto flex justify-end items-center text-blue-500 p-2 hover:text-blue-400">
          <i class="material-icons"></i>
        </button>
      </div>

      <div className="flex justify-center">
        <Table
          pageCount={pageCount}
          fetchData={fetchData}
          columns={columns}
          loading={loading}
          data={data}
        />
      </div>
    </div>
  );
}

export default App;
