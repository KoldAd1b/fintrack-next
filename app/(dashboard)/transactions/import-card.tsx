import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { format, parse } from "date-fns";

import { ImportTable } from "./import-table";
import { convertAmountToMiliunits } from "@/lib/utils";
import { toast } from "sonner";

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];

interface SelectedColumnsState {
  [key: string]: string | null;
}

type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
};

const ImportCard = ({ data, onCancel, onSubmit }: Props) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {}
  );

  const headers = data[0];
  const body = data.slice(1);

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };

      //   for (const key in newSelectedColumns) {
      //     if (newSelectedColumns[key] === value) {
      //       newSelectedColumns[key] = null;
      //     }
      //   }

      newSelectedColumns[`column_${columnIndex}`] = value;

      if (value === "skip") {
        delete newSelectedColumns[`column_${columnIndex}`];
      }

      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;
  const handleContinue = () => {
    const getColumnIndex = (column: string) => {
      return column.split("_")[1];
    };

    try {
      const mappedData = {
        headers: headers.map((_header, index) => {
          const columnIndex = getColumnIndex(`column_${index}`);
          return selectedColumns[`column_${columnIndex}`] || null;
        }),
        body: body
          .map((row) => {
            const transformedRow = row.map((cell, index) => {
              const columnIndex = getColumnIndex(`column_${index}`);
              return selectedColumns[`column_${columnIndex}`] ? cell : null;
            });

            return transformedRow.every((item) => item == null)
              ? []
              : transformedRow;
          })
          .filter((row) => row.length > 0),
      };

      const arrayOfData = mappedData.body.map((row) => {
        return row.reduce((acc: any, cell, index) => {
          const header = mappedData.headers[index];
          if (header != null) {
            acc[header] = cell;
          }
          return acc;
        }, {});
      });
      const formattedData = arrayOfData.map((item) => {
        return {
          ...item,
          amount: convertAmountToMiliunits(parseFloat(item.amount)),
          date: format(parse(item.date, dateFormat, new Date()), outputFormat),
        };
      });
      onSubmit(formattedData);
    } catch (err) {
      toast.error("Invalid headers", {
        description:
          "Make sure you are selecting the correct columns for the date, account, and payee",
      });
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Import Transaction
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button onClick={onCancel} size="sm" className="w-full lg:w-auto">
              Cancel
            </Button>
            <Button
              size={"sm"}
              disabled={progress < requiredOptions.length}
              onClick={() => {
                handleContinue();
              }}
            >
              Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportCard;
