import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useTable, usePagination, useExpanded, useSortBy, useFilters } from "react-table";
import ClockLoader from "react-spinners/ClockLoader";
import { css } from "@emotion/react";
import { matchSorter } from "match-sorter";
import "./style.css";
import {
  Pagination,
  PagincationButtonContainer,
  PaginationButton,
  PaginationIndex,
  RightIconSpan,
  LeftIconSpan,
  NextButtonIcon,
  BackButtonIcon,
} from "./paginationStyle";



const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TableComponent = ({
  columns,
  data,
  fetchData,
  pageCount: controlledPageCount,
  loading,
  isPaginated = true,
  ...props
}) => {

    const DefaultColumnFilter =({
        column: { filterValue, preFilteredRows, setFilter },
    }) => {
        const count = preFilteredRows.length
      
        return (
          <input
            value={filterValue || ''}
            onChange={e => {
              setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ${count} records...`}
          />
        )
    }

    function fuzzyTextFilterFn(rows, id, filterValue) {
        return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
    }

    fuzzyTextFilterFn.autoRemove = val => !val

    const filterTypes = React.useMemo(
        () => ({
          // Add a new fuzzyTextFilterFn filter type.
          fuzzyText: fuzzyTextFilterFn,
          // Or, override the default text filter to use
          // "startWith"
          text: (rows, id, filterValue) => {
            return rows.filter(row => {
              const rowValue = row.values[id]
              return rowValue !== undefined
                ? String(rowValue)
                    .toLowerCase()
                    .startsWith(String(filterValue).toLowerCase())
                : true
            })
          },
        }),
        []
      )

  const defaultColumn = useMemo(
    () => ({
        // Let's set up our default Filter UI
        Filter: DefaultColumnFilter,
      }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setHiddenColumns,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        pageIndex: 0,
        pageSize: 5,
        hiddenColumns: columns
          .filter((column) => !column.show)
          .map((column) => column.id),
      },
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount: controlledPageCount,
      filterTypes
    },
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  React.useEffect(() => {
    fetchData && fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);

  return (
    <Fragment>
      {loading ? (
        <div>
          {" "}
          <ClockLoader
            color={"#000000"}
            loading={loading}
            css={override}
            size={150}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="-my-2 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="align-middle inline-block min-w-full shadow sm:rounded-lg border-b border-gray-200"></div>
            <table
              className="min-w-full divide-y divide-gray-200"
              {...getTableProps()}
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                        {...column.getHeaderProps()}
                      >
                        {column.render("Header")}
                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody
                className="bg-white divide-y divide-gray-200"
                {...getTableBodyProps()}
              >
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return (
                          <td
                            className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900"
                            {...cell.getCellProps()}
                          >
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {console.log(isPaginated, canPreviousPage, canNextPage)}
            {console.log(nextPage())}
            {isPaginated && (
              <Pagination>
                <PaginationIndex>
                  page {pageIndex + 1} of {pageCount}
                </PaginationIndex>{" "}
                <PagincationButtonContainer>
                  {canPreviousPage ? (
                    <PaginationButton onClick={() => previousPage()}>
                      <LeftIconSpan>
                        <BackButtonIcon />
                      </LeftIconSpan>
                      Back
                    </PaginationButton>
                  ) : null}
                  {canNextPage ? (
                    <PaginationButton onClick={() => nextPage()}>
                      Next{" "}
                      <RightIconSpan>
                        <NextButtonIcon />
                      </RightIconSpan>
                    </PaginationButton>
                  ) : null}
                </PagincationButtonContainer>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TableComponent;