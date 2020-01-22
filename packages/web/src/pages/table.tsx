import React from 'react'
import {
  Box,
  Badge,
  Stack,
  Code,
  BoxProps,
  Input,
  Link,
  Tooltip
} from '@chakra-ui/core'
import logs from '../../tableData'
import { useTable, useExpanded } from 'react-table'
import { useMap, useKey, useKeyPress } from 'react-use'
import { getStatusText } from 'http-status-codes'

interface CellProps extends BoxProps {
  onClick?: () => void
  onAltClick?: () => void
}

const Cell: React.FC<CellProps> = ({
  onClick,
  onAltClick,
  children,
  ...props
}) => {
  const [isAltPressed] = useKeyPress('Alt')
  const _onClick = React.useCallback(() => {
    if (isAltPressed && onAltClick) {
      return onAltClick
    }
    return onClick
  }, [isAltPressed])
  const textDecoration = React.useMemo(() => {
    if (isAltPressed && onAltClick) {
      return 'line-through'
    }
    return 'underline'
  }, [isAltPressed])
  return (
    <Code
      backgroundColor="transparent"
      fontSize="xs"
      display="block"
      {...props}
    >
      {_onClick ? (
        <Link
          onClick={_onClick}
          _hover={{
            textDecoration
          }}
        >
          {children}
        </Link>
      ) : (
        children
      )}
    </Code>
  )
}

const LevelFilter = ({}) => {
  type LevelsState = {
    10: boolean
    20: boolean
    30: boolean
    40: boolean
    50: boolean
    60: boolean
  }

  const [map, { set }] = useMap<LevelsState>({
    10: false,
    20: false,
    30: true,
    40: true,
    50: true,
    60: true
  })
  const levels: (keyof LevelsState)[] = [10, 20, 30, 40, 50, 60]

  return (
    <Stack isInline>
      {levels.map(level => (
        <LevelBadge
          key={level}
          level={level}
          cursor="pointer"
          onClick={() => set(level, !map[level])}
          opacity={map[level] ? 1 : 0.5}
        />
      ))}
    </Stack>
  )
}

const LevelBadge: React.FC<{ level: number } & BoxProps> = ({
  level,
  ...props
}) => {
  const commonProps: BoxProps = {
    fontWeight: 'semibold',
    textTransform: 'lowercase',
    textAlign: 'center',
    boxShadow: 'none',
    w: 10,
    userSelect: 'none'
  }

  const variant = React.useMemo(() => {
    if (level <= 20) return 'outline'
    if (level <= 50) return 'subtle'
    return 'solid'
  }, [level])

  const variantColor = React.useMemo(() => {
    if (level <= 10) return 'gray'
    if (level <= 20) return 'purple'
    if (level <= 30) return 'blue'
    if (level <= 40) return 'orange'
    return 'red'
  }, [level])

  const text = React.useMemo(() => {
    if (level <= 10) return 'trace'
    if (level <= 20) return 'debug'
    if (level <= 30) return 'info'
    if (level <= 40) return 'warn'
    if (level <= 50) return 'error'
    return 'fatal'
  }, [level])

  return (
    <Badge
      variant={variant}
      variantColor={variantColor}
      {...commonProps}
      {...props}
    >
      {text}
    </Badge>
  )
}

const StatusCodeBadge: React.FC<{ statusCode: number } & CellProps> = ({
  statusCode,
  ...props
}) => {
  const variantColor = React.useMemo(() => {
    if (statusCode <= 199) {
      return 'gray'
    }
    if (statusCode <= 299) {
      return 'green'
    }
    if (statusCode <= 399) {
      return 'blue'
    }
    if (statusCode <= 499) {
      return 'orange'
    }
    return 'red'
  }, [statusCode])

  const variant = React.useMemo(() => {
    if (statusCode <= 399) {
      return 'subtle'
    }
    if (statusCode <= 499) {
      switch (statusCode) {
        case 404:
          return 'subtle'
        default:
          return 'outline'
      }
    }
    return 'solid'
  }, [statusCode])

  const statusText = getStatusText(statusCode)

  return (
    <Tooltip
      label={statusText}
      aria-label={`${statusCode} ${statusText}`}
      showDelay={1500}
      placement="right"
      hasArrow
    >
      <Badge
        variant={variant}
        variantColor={variantColor}
        fontWeight="semibold"
        cursor="pointer"
        {...props}
      >
        {statusCode}
      </Badge>
    </Tooltip>
  )
}

const MethodBadge: React.FC<{
  method: string
  onAltClick: () => void
} & CellProps> = ({ method, ...props }) => {
  // Follow Insomnia colors
  const color = React.useMemo(() => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'purple.500'
      case 'POST':
        return 'green.600'
      case 'PUT':
        return 'orange.500'
      case 'PATCH':
        return 'yellow.600'
      case 'DELETE':
        return 'red.600'
      case 'HEAD':
      case 'OPTIONS':
        return 'blue.500'
      default:
        return 'gray.600'
    }
  }, [method])

  return (
    <Cell color={color} fontWeight="medium" textAlign="center" {...props}>
      {method}
    </Cell>
  )
}

const Table = () => {
  const columns = React.useMemo(
    () => [
      {
        // Make an expander cell
        Header: () => null, // No header
        id: 'expander', // It needs an ID
        Cell: ({ row }) => (
          // Use Cell to render an expander for each row.
          // We can use the getExpandedToggleProps prop-getter
          // to build the expander.
          <span {...row.getExpandedToggleProps()}>
            {row.isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </span>
        )
      },
      {
        Header: 'Date / Time',
        accessor: 'time',
        Cell: ({ cell }) => (
          <Cell color="gray.700">
            {new Date(cell.value).toISOString().replace('T', ' ')}
          </Cell>
        )
      },
      {
        Header: 'Instance',
        accessor: 'instance',
        Cell: ({ cell }) => (
          <Cell
            color="gray.600"
            // todo: Filter
            onClick={() => console.log(cell.value)}
          >
            {cell.value.slice(0, 8)}
          </Cell>
        )
      },
      {
        Header: 'Commit',
        accessor: 'commit',
        Cell: ({ cell }) => (
          <Cell
            color="gray.600"
            // todo: Filter
            onClick={() => console.log(cell.value)}
          >
            {cell.value.slice(0, 8)}
          </Cell>
        )
      },

      {
        Header: 'Level',
        accessor: 'level',
        Cell: ({ cell }) => <LevelBadge level={cell.value} mx={2} />
      },
      {
        H: 'Category',
        accessor: 'category',
        Cell: ({ cell }) => (
          <Cell
            color="gray.600"
            fontWeight="medium"
            textAlign="center"
            mx={2}
            // todo: Filter
            onClick={() => console.log(cell.value)}
          >
            {cell.value}
          </Cell>
        )
      },
      {
        Header: 'Request ID',
        accessor: 'req.id',
        Cell: ({ cell }) =>
          cell.value ? (
            <>
              <Cell
                color="gray.600"
                fontWeight="medium"
                textAlign="center"
                display="inline"
                // todo: Filter
                onClick={() => console.log(cell.value.split('.')[0])}
              >
                {cell.value.split('.')[0].slice(0, 4)}
              </Cell>
              .
              <Cell
                color="gray.600"
                fontWeight="medium"
                textAlign="center"
                display="inline"
                // todo: Filter
                onClick={() => console.log(cell.value.split('.')[1])}
              >
                {cell.value.split('.')[1].slice(0, 4)}
              </Cell>
            </>
          ) : null
      },
      {
        H: 'Status',
        accessor: 'res.statusCode',
        Cell: ({ cell }) =>
          cell.value ? (
            <StatusCodeBadge
              statusCode={cell.value}
              mx={2}
              // todo: Filter
              onClick={() => console.log(cell.value)}
            />
          ) : null
      },
      {
        Header: 'Method',
        accessor: 'req.method',
        Cell: ({ cell }) =>
          cell.value ? (
            <MethodBadge
              method={cell.value}
              onClick={() => {
                console.log(cell.value)
              }}
              onAltClick={() => {
                console.log('!', cell.value)
              }}
            />
          ) : null
      },
      {
        Header: () => (
          <>
            Path
            <Input fontSize="sm" h="24px" px={2} />
          </>
        ),

        accessor: 'req.url',
        Cell: ({ cell }) => (
          <Cell color="gray.700" fontWeight="medium">
            {cell.value}
          </Cell>
        )
      },

      {
        H: 'Duration',
        accessor: 'responseTime',
        Cell: ({ cell }) => (
          <Cell color="gray.600" fontWeight="medium" textAlign="right">
            {cell.value} ms
          </Cell>
        )
      },
      {
        H: 'Size',
        accessor: 'res.headers.content-length',
        Cell: ({ cell }) => (
          <Cell color="gray.600" fontWeight="medium" textAlign="right">
            {cell.value}
          </Cell>
        )
      }
    ],
    []
  )

  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <pre
        style={{
          fontSize: '10px'
        }}
      >
        <code>{JSON.stringify(row.original, null, 2)}</code>
      </pre>
    ),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatColumns
  } = useTable(
    {
      columns,
      data: logs
    },
    useExpanded
  )

  return (
    <>
      <LevelFilter />
      <Box as="table" {...getTableProps()} fontSize="sm">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <Box as="th" fontWeight="semibold" {...column.getHeaderProps()}>
                  {column.render('Header')}
                </Box>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            // todo: Handle common column hiding
            const original: any = row.original
            let lastColumnIndex = 0
            if (!original.req) {
              return (
                <Box as="tr" {...row.getRowProps()} key={i}>
                  {row.cells
                    .filter((_, i) => i < 6)
                    .map((cell, i) => {
                      lastColumnIndex = i
                      return (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      )
                    })}
                  {
                    <td colSpan={flatColumns.length - lastColumnIndex}>
                      <Cell fontWeight="medium" color="gray.700">
                        {original.msg}
                      </Cell>
                    </td>
                  }
                </Box>
              )
            }

            return (
              // Use a React.Fragment here so the table markup is still valid
              <React.Fragment key={i}>
                <Box as="tr" {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    )
                  })}
                </Box>
                {/*
                    If the row is in an expanded state, render a row with a
                    column that fills the entire length of the table.
                  */}
                {(row as any).isExpanded ? (
                  <tr>
                    <td colSpan={flatColumns.length}>
                      {/*
                          Inside it, call our renderRowSubComponent function. In reality,
                          you could pass whatever you want as props to
                          a component like this, including the entire
                          table instance. But for this example, we'll just
                          pass the row
                        */}
                      {renderRowSubComponent({ row })}
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            )
          })}
        </tbody>
      </Box>
    </>
  )
}

export default Table
