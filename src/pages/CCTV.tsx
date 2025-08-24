import { useEvaAPICall, EvaErrorMessage } from "@eva-ics/webengine-react";
import { useState, useMemo } from "react";
import { Timestamp } from "bmat/time";
import { downloadCSV } from "bmat/dom";
import {
    DashTable,
    DashTableFilter,
    DashTableData,
    DashTableColType,
    DashTableColData,
    ColumnRichInfo,
    DashTableFilterActionKind,
    pushRichColData,
    createRichFilter,
    generateDashTableRichCSV,
} from "bmat/dashtable";
import { useQueryParams } from "bmat/hooks";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import DateTimePickerSelect from "../components/date_time_picker.tsx";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { addButton, removeButton } from "../components/common.tsx";
import { ButtonStyled } from "../common.tsx";

const DEFAULT_FRAME_SEC = 3600;
const SVC_ID = "eva.vidosrv.default";

const DashboardCCTV = () => {
    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
            CCTV
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCCTV;
