import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Table from "./component/table";
import "./App.css";
import _ from "lodash";
import axios from 'axios'

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
      
      const response = await axios.get(`http://localhost:8080/api/issue?priority=${priority}&label=${label}&pageNumber=${pageIndex}&pageSize=${pageSize}`)
      const pages = parseInt(parseInt(response.data.pages)/parseInt(5))

      setData(response.data.data);
      setPageCount(pages);
      setLoading(false);
    } catch (e) {
      console.log("error", e);
      setLoading(false)
    }
  };

  const fetchData = useCallback(
    ({ pageSize, pageIndex }) => {
      // This will get called when the table needs new data of pagination
      fetchAPIData({
        pageIndex,
        pageSize,
        search: searchTerm,
        priority,
        label
      });
    },
    []
  );

  const columns = useMemo(() => [
    { 
      Header: "Title", 
      accessor: (d) => d.title, 
      show: true,
      filterAll: true,
    },
    { 
      Header: "Priority", 
      accessor: (d) => d.priority, 
      show: true,
      filterAll: true,
    },
    { 
      Header: "Label", 
      accessor: (d) => d.label.map(text => <p>{text}</p>), 
      show: true,
      filterAll: true,
    }
  ]);

  return (
    <div className="container mx-auto flex flex-col">
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
