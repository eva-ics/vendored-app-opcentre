import { DashTable, DashTableData } from "bmat/dashtable";
import { useEvaAPICall, EvaErrorMessage } from "@eva-ics/webengine-react";
import { useState, useMemo } from "react";
import { useQueryParams } from "bmat/hooks";
import { copyTextClipboard } from "bmat/dom";
import { ButtonStyled } from "../common.tsx";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import SubtitlesOutlinedIcon from "@mui/icons-material/SubtitlesOutlined";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const LANGS = ["C", "Rust"];

const DEFAULT_LANG = LANGS[0];

const fieldType = (type: string): string => {
    const [name, array_size] = type.split(",", 2);
    if (array_size) {
        return `Array ${array_size} of ${name}`;
    } else {
        return name;
    }
};

const DataObjectViewer = ({
    params,
    set,
    setLastSelectedLang,
    setLastAsCode,
    remove,
}: {
    params: ViewParams;
    set: (params: ViewParams) => void;
    setLastSelectedLang: (lang: string) => void;
    setLastAsCode: (state: boolean) => void;
    remove: (name: string) => void;
}) => {
    const setViewAsCode = (state: boolean) => {
        params.asCode = state;
        setLastAsCode(state);
        set(params);
    };
    const setLang = (lang: string) => {
        params.lang = lang;
        setLastSelectedLang(lang);
        set(params);
    };
    const call_params = useMemo(() => {
        let p: any = { i: params.name };
        if (params.asCode) {
            p.lang = params.lang.toLowerCase();
        }
        return p;
    }, [params.name, params.asCode, params.lang]);
    const dobj_data = useEvaAPICall({
        method: params.asCode ? "dobj.generate_struct_code" : "dobj.get_struct",
        params: call_params,
        update: 10,
    });
    let viewer;
    let switchButton;
    const copyCode = () => {
        copyTextClipboard(dobj_data.data.code);
    };
    if (params.asCode) {
        if (dobj_data?.data?.code) {
            viewer = (
                <div>
                    <pre className="dobj-code-pre">{dobj_data.data.code}</pre>
                </div>
            );
        } else {
            viewer = <></>;
        }
        const lang_select = (
            <div className="dobj-lang-select">
                <div className="dobj-lang-select-label">Lang:</div>
                <Select
                    sx={{ minWidth: "200px" }}
                    value={params.lang}
                    onChange={(e) => {
                        setLang(e.target.value);
                    }}
                >
                    {LANGS.map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </Select>
            </div>
        );
        switchButton = (
            <>
                <ButtonStyled
                    title="Switch to table view"
                    variant="outlined"
                    onClick={() => setViewAsCode(false)}
                >
                    <TableRowsOutlinedIcon style={{ fontSize: 15 }} />
                </ButtonStyled>
                <ButtonStyled variant="outlined" onClick={copyCode}>
                    <ContentCopyIcon style={{ fontSize: 15 }} />
                </ButtonStyled>
                {lang_select}
            </>
        );
    } else {
        viewer = (
            <table className="bmat-dashtable">
                <tbody>
                    {dobj_data?.data?.fields?.map((field: any, i: number) => {
                        return (
                            <tr key={i} className="bmat-dashtable-row dobj-field-row">
                                <td className="bmat-dashtable-col">{field.name}</td>
                                <td className="bmat-dashtable-col dobj-field-type">
                                    {fieldType(field.type)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
        switchButton = (
            <ButtonStyled
                title="Switch to code view"
                variant="outlined"
                onClick={() => setViewAsCode(true)}
            >
                <SubtitlesOutlinedIcon style={{ fontSize: 15 }} />
            </ButtonStyled>
        );
    }
    return (
        <div className="bmat-dashtable-container dobj-view-container">
            <div className="bmat-dashtable-title">
                {params.name}
                <button className="dobj-close-button" onClick={() => remove(params.name)}>
                    x
                </button>
            </div>
            <div className="bmat-dashtable-container-inner">
                <div className="button-bar">{switchButton}</div>
                <div>
                    <EvaErrorMessage error={dobj_data.error} />
                </div>
                <div className="bmat-dashtable-table-container">{viewer}</div>
            </div>
        </div>
    );
};

interface ViewParams {
    name: string;
    asCode: boolean;
    lang: string;
}

const DashboardDataObjects = () => {
    const [viewed, setViewed] = useState<ViewParams[]>([]);
    const [lastSelectedLang, setLastSelectedLang] = useState(DEFAULT_LANG);
    const [lastAsCode, setLastAsCode] = useState(false);

    const addViewed = (name: string) => {
        let params = viewed.find((item) => item.name === name);
        let array = viewed.filter((item) => item.name !== name);
        array.unshift(
            params || { name: name, asCode: lastAsCode, lang: lastSelectedLang }
        );
        setViewed(array);
    };

    const setViewParams = (params: ViewParams) => {
        let array = viewed.map((item) => {
            if (item.name === params.name) {
                return params;
            } else {
                return item;
            }
        });
        setViewed(array);
    };

    const removeViewed = (name: string) => {
        let array = viewed.filter((item) => item.name !== name);
        setViewed(array);
    };

    const loaded = useQueryParams(
        [
            {
                name: "v",
                value: viewed,
                setter: setViewed,
                pack_json: true,
            },
            {
                name: "l",
                value: lastSelectedLang,
                setter: setLastSelectedLang,
            },
            {
                name: "c",
                value: lastAsCode,
                encoder: (v) => (v ? "1" : "0"),
                decoder: (v) => v === "1",
                setter: setLastAsCode,
            },
        ],
        [viewed]
    );

    const data_objects = useEvaAPICall({
        method: loaded ? "dobj.list" : undefined,
        update: 10,
    });

    const data: DashTableData = data_objects?.data?.map((dobj: any) => {
        return {
            data: [
                { value: dobj.name },
                { value: dobj.size, className: "col-fit" },
                {
                    value: <button onClick={() => addViewed(dobj.name)}>View</button>,
                    className: "col-fit print-hidden",
                },
            ],
        };
    });

    let header = (
        <div>
            <EvaErrorMessage error={data_objects.error} />
        </div>
    );

    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-small">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <DashTable
                            id="dobj"
                            title="Data objects"
                            cols={["name", "size", ""]}
                            header={header}
                            data={data}
                            className="table-dobj"
                            rememberQs={true}
                        />
                    </div>
                    <div className="dashboard-main-wrapper-content__side-right">
                        {viewed.map((params, i) => (
                            <DataObjectViewer
                                key={i}
                                params={params}
                                set={setViewParams}
                                setLastSelectedLang={setLastSelectedLang}
                                setLastAsCode={setLastAsCode}
                                remove={removeViewed}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardDataObjects;
