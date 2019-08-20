import React from 'react';
import moment from "moment";

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: "",
            raw: ""
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const {selectedValue} = this.props;

        if(selectedValue !== prevProps.selectedValue) {
            this.setState({display: this.resolveDisplayValue(selectedValue)});
        }
    }

    resolveDisplayValue = value => {
        const {datePicker, timePicker} = this.props;
        let display = "";

        if(moment.isMoment(value)) {
            const format = [];

            if(datePicker || !timePicker) {
                format.push("Y/MM/DD");
            }

            if(timePicker) {
                format.push("hh:mm A");
            }

            display = value.format(format.join(' '));
        }

        return display;
    };

    getDateRawValue = (value, cursor) => {
        const currentRaw = this.state.raw.substr(0, 8);
        const cursorRawValue = value.substr(0, cursor).replace(/[^\d]/g, '');
        let rawValue = value.replace(/[^\d]/g, '').substr(0, 8);

        const startPosition = this.getChangeStartPosition(currentRaw, cursorRawValue);
        console.log(rawValue, currentRaw, cursorRawValue, startPosition);
        // Check for deletions
        let deleteLength = 0;
        for(let i = startPosition; i < currentRaw.length && i < rawValue.length; i++, deleteLength++) {
            // Look for index of continuation
            if(rawValue[cursorRawValue.length] === currentRaw[i]) {
                break;
            }
        }

        // Replace insertions
        let newRaw = rawValue.substr(0, startPosition) + '0'.repeat(deleteLength)
            + cursorRawValue.substr(startPosition) + currentRaw.substr(cursorRawValue.length + deleteLength);
        console.log("rv", rawValue.substr(0, startPosition));
        console.log("dl", '0'.repeat(deleteLength));
        console.log("crv", cursorRawValue.substr(startPosition));
        console.log("rve", rawValue.substr(cursorRawValue.length + deleteLength));


        let lastCharIndex = 0;
        for(let i = 0; i < rawValue.length && lastCharIndex < value.length; i++) {
            while(lastCharIndex < value.length) {
                if(rawValue[i] === value[lastCharIndex++]) {
                    break;
                }
            }
        }
        lastCharIndex--;

        return [
            newRaw,
            lastCharIndex
        ];
    };

    getTimeRawValue = value => {
        const ampm = value.match(/(AM?|PM?)$/, '');
        const rawValue = value.replace(/[^\d]/g, '');

        return [
            '',
            0
        ];
    };

    getChangeStartPosition = (prev, cur) => {
        let i = 0;
        for(;i < cur.length || i < prev.length; i++) {
            if(prev[i] !== cur[i]) {
                return i;
            }
        }

        return i;
    };

    handleChange = event => {
        const {display} = this.state;
        const {target} = event;
        const {value} = target;

        // Get cursor position
        let cur = target.selectionStart;

        // Get raw value up to cursor
        //const cursorRaw = this.getDateRawValue(value.substr(0, cur));

        // Get input date raw value
        const [dateRawValue, dateLastCharIndex, dateNumberOfMovements] = this.getDateRawValue(value, cur);

        // Get input time raw value
        const [timeRawValue, timeLastCharIndex] = this.getTimeRawValue(value.substr(dateLastCharIndex));

        const dispRaw = dateRawValue + timeRawValue;
        // Get display raw value
        // const dispRaw = this.getDateRawValue(display);

        // Get current raw value
        // let currentRaw = this.state.raw;
        //
        // // Get change start position
        // const changeStart = this.getChangeStartPosition(dispRaw, cursorRaw);
        //
        // // Count length difference
        // let rawDiffLength = dispRaw.length - currentRaw.length;
        // console.log(rawDiffLength);
        //
        // if(rawDiffLength < 0) {
        //     // Deleted, replace missing with zeroes.
        //     if(changeStart < currentRaw.length) {
        //         currentRaw = currentRaw.slice(0, changeStart) + "0".repeat(Math.abs(rawDiffLength))
        //             + currentRaw.slice(changeStart + rawDiffLength + 1);
        //     }
        // } else {
        //     const cursorRawSlice = cursorRaw.slice(changeStart);
        //     console.log(cursorRawSlice);
        //     currentRaw = currentRaw.slice(0, changeStart) + cursorRawSlice
        //         + currentRaw.slice(changeStart + cursorRawSlice.length + 1);
        // }

        // // Get length difference of value and display
        // const lengthDiff = value.length - display.length;
        //
        // if(lengthDiff === -1 && currentRaw === dispRaw) {
        //     if(value === display.substr(0, display.length - 1)) {
        //         // Must have deleted a delimiter.
        //         currentRaw = currentRaw.substr(0, currentRaw.length - 1);
        //     }
        // }

        // Rectify the raw value
        const rect = this.rectifyRawValue(dispRaw);
        const rectDiffLength = rect.length - dispRaw.length;
        if(rectDiffLength > 0) {
            cur = cur + rectDiffLength;
        }

        // this.setState({display: this.formatDisplay(rect)}, () => {
        //     target.setSelectionRange(cur, cur);
        // });
        this.setState({raw: rect});
    };

    formatDisplay = value => {
        const {length} = value;
        let disp = "";
        if(length) { disp += value.substr(0, 4); }
        if(length >= 4) { disp += "/"; }
        if(length > 4) { disp += value.substr(4, 2); }
        if(length >= 6) { disp += "/"; }
        if(length > 6) { disp += value.substr(6, 2); }
        if(length >= 8) { disp += " "; }
        if(length > 8) { disp += value.substr(8, 2); }
        if(length >= 10) { disp += ":"; }
        if(length > 10) { disp += value.substr(10, 2); }
        if(length >= 12) { disp += " "; }
        if(length === 13) { disp += value[12] === 'a' ? "AM" : "PM"; }

        return disp;
    };

    rectifyRawValue = value => {
        let rect = "";

        rect += this.rectifyRawDate(value);
        rect += this.rectifyRawTime(value.substr(8));

        return rect;
    };

    rectifyRawDate = value => {
        const {length} = value;
        let rect = "";
        if(length > 4) {
            const year = value.substr(0, 4);
            rect += year;

            let month = '01';
            if(length === 5) {
                if(value[4] > '1') {
                    rect += `0${value[4]}`;
                } else {
                    rect += value[4];
                }
            } else if(length >= 6) {
                const rawMonth = value.substr(4, 2);
                if(rawMonth === "00") {
                    rect += '01';
                } else if(rawMonth <= "12") {
                    rect += rawMonth;
                    month = rawMonth;
                } else if(rawMonth < "20") {
                    month = '12';
                    rect += month;
                } else {
                    month = "0" + rawMonth[0];
                    rect += month;
                }
            }

            const daysInMonth = moment(`${year}${month}`, 'YYYYMM').daysInMonth().toString(10);
            if(length === 7) {
                if(value[6] > daysInMonth[0]) {
                    rect += `0${value[6]}`;
                } else {
                    rect += value[6];
                }
            } else if(length >= 8) {
                const rawDay = value.substr(6, 2);
                if(rawDay === "00") {
                    rect += '01';
                } else if(rawDay <= daysInMonth) {
                    rect += rawDay;
                } else {
                    rect += daysInMonth;
                }
            }
        } else {
            rect = value;
        }

        return rect;
    };

    rectifyRawTime = value => {
        const {length} = value;
        let rect = "";
        if(length === 1) {
            if(value[0] > '1') {
                rect += `0${value[0]}`;
            } else {
                rect += value[0];
            }
        } else if(length >= 2) {
            const rawHour = value.substr(0, 2);
            if(rawHour === "00") {
                rect += "01";
            } else if(rawHour <= "12") {
                rect += rawHour;
            } else if(rawHour < "20") {
                rect += "12";
            } else {
                rect += "0" + rawHour[0];
            }
        }

        if(length === 3) {
            if(value[2] > '5') {
                rect += `0${value[2]}`;
            } else {
                rect += value[2];
            }
        } else if(length >= 4) {
            const rawMinute = value.substr(2, 2);
            if(rawMinute <= "59") {
                rect += rawMinute;
            } else {
                rect += "0" + rawMinute[0];
            }
        }

        if(length === 5) {
            rect += value[4];
        }

        return rect;
    };

    renderDisplay = () => {
        const {raw} = this.state;
        return this.formatDisplay(raw);
    };

    render() {
        const {disabled, innerRef, onFocus} = this.props;
        const display = this.renderDisplay();
        const mask = "yyyy/mm/dd hh:mm aa";

        const inputStyle = {
            //backgroundColor: this.props.disabled ? "#eee" : "#fff",
            borderColor: this.props.isFocused ? "#3c8dbc" : undefined
        };

        return (
            <div ref={this.props.containerRef} className="dralt-cal-input-container">
                <div className="dralt-cal-mask">
                    <span style={{color: 'white'}}>{display}</span>
                    <span>{mask.substr(display.length)}</span>
                </div>
                <input className="form-control" style={inputStyle} ref={innerRef} spellCheck={false}
                       onFocus={onFocus} value={display} onChange={this.handleChange}
                       disabled={disabled}/>
            </div>
        );
    }
}

Input.defaultProps = {
    selectedValue: null,
    containerRef: null
};

export default Input;