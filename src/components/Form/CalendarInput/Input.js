import React from 'react';
import moment from "moment";

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: "",
            raw: ""
        };

        this.selectionStart = 0;
        this.selectionEnd = 0;
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
                format.push("YYYY/MM/DD");
            }

            if(timePicker) {
                format.push("hh:mm A");
            }

            display = value.format(format.join(' '));
        }

        return display;
    };

    dateReplaceAtPosition = (value, position, insertion) => {
        let newValue = value.substring(0, position);
        let offset = 0, dayStale = false;
        if(insertion) {
            let newInsertion = "";
            if(position < 4) {
                if(insertion.match(/^\d$/)) {
                    newInsertion = insertion;
                    dayStale = true;
                }
            } else if(position === 4 && insertion === '/') {
                newInsertion = '/';
            } else if(position === 4 || position === 5) {
                if(insertion.match(/^\d$/)) {
                    if(value[6]) {
                        const month = insertion + value[6];
                        if(month > '12') {
                            newInsertion = '12';
                        } else if(month < '01') {
                            newInsertion = '01';
                        } else {
                            newInsertion = insertion;
                        }
                    } else {
                        newInsertion = insertion > '1' ? "0" + insertion : insertion;
                    }

                    if(position === 4) {
                        newInsertion = '/' + newInsertion;
                    }
                    dayStale = true;
                }
            } else if(position === 6) {
                if(insertion.match(/^\d$/)) {
                    const month = value[5] + insertion;
                    if (month > '12') {
                        newInsertion = '2'
                    } else if(month < '01') {
                        newInsertion = '1';
                    } else {
                        newInsertion = insertion;
                    }
                    dayStale = true;
                }
            } else if(position === 7 && insertion === '/'){
                newInsertion = '/';
            } else if(position >= 7) {
                if(insertion.match(/^\d$/)) {
                    const daysInMonth = moment(value.substring(0, 7), 'YYYY/MM').daysInMonth().toString(10);
                    if(position === 7 || position === 8) {
                        if(value[9]) {
                            const day = insertion + value[9];
                            if(day > daysInMonth) {
                                newInsertion = daysInMonth;
                            } else if(day < '01') {
                                newInsertion = '01';
                            } else {
                                newInsertion = insertion;
                            }
                        } else {
                            newInsertion = insertion > daysInMonth[0] ? "0" + insertion : insertion;
                        }

                        if(position === 7) {
                            newInsertion = '/' + newInsertion;
                        }
                    } else if(position === 9) {
                        const day = value[8] + insertion;
                        if(day > daysInMonth) {
                            newInsertion = daysInMonth[1];
                        } else if(day < '01') {
                            newInsertion = '1';
                        } else {
                            newInsertion = insertion;
                        }
                    }
                }
            }

            offset = newInsertion.length;
            const newPosition = position + offset;
            if((newPosition === 4 || newPosition === 7) && offset) {
                newInsertion += '/';
                offset++;
            }

            newValue += newInsertion + value.substring(position + offset);

            if(dayStale && newValue.length >= 10) {
                const daysInMonth = moment(newValue.substring(0, 7), 'YYYY/MM').daysInMonth().toString(10);
                const day = newValue.substring(8, 10);
                if(day > daysInMonth) {
                    newValue = newValue.substring(0, 8) + daysInMonth + newValue.substring(10);
                }
            }
        }

        return [
            newValue,
            offset
        ];
    };

    timeReplaceAtPosition = (value, position, insertion) => {
        console.log({value, position, insertion});
        let newValue = value.substring(0, position);
        let offset = 0;
        if(insertion) {
            let newInsertion = "";
            if(position === 0) {
                if(insertion.match(/^\d$/)) {
                    if(value[1]) {
                        const hour = insertion + value[1];
                        if(hour > '12') {
                            newInsertion = '12';
                        } else if(hour < '01') {
                            newInsertion = '01';
                        } else {
                            newInsertion = insertion;
                        }
                    } else {
                        newInsertion = insertion > '1' ? '0' + insertion : insertion;
                    }
                }
            } else if(position === 1) {
                if(insertion.match(/^\d$/)) {
                    const hour = value[0] + insertion;
                    if(hour > '12') {
                        newInsertion = '2';
                    } else if(hour < '01') {
                        newInsertion = '1';
                    } else {
                        newInsertion = insertion;
                    }
                }
            } else if(position === 2 && insertion === ':') {
                newInsertion = ':';
            } else if(position === 2 || position === 3) {
                if(insertion.match(/^\d$/)) {
                    if(value[4]) {
                        const minute = insertion + value[4];
                        if(minute > '59') {
                            newInsertion = '00';
                        } else {
                            newInsertion = insertion;
                        }
                    } else {
                        newInsertion = insertion > '5' ? '0' + insertion : insertion;
                    }

                    if(position === 2) {
                        newInsertion = ':' + newInsertion;
                    }
                }
            } else if(position === 4) {
                if(insertion.match(/^\d$/)) {
                    newInsertion = insertion;
                }
            } else if(position === 5 && insertion === ' ' ) {
                newInsertion = ' ';
            } else if(position === 5 || position === 6) {
                const ap = insertion.toUpperCase();
                if(ap === 'A' || ap === 'P') {
                    newInsertion = ap + 'M';
                }

                if(position === 5) {
                    newInsertion = ' ' + newInsertion;
                }
            } else if(position === 7) {
                const m = insertion.toUpperCase();
                if(m === 'M') {
                    newInsertion = 'M';
                }
            }

            offset = newInsertion.length;
            const newPosition = position + offset;
            if(newPosition === 2 && offset) {
                newInsertion += ':';
                offset++;
            }

            if(newPosition === 5 && offset) {
                newInsertion += ' ';
                offset++;
            }

            newValue += newInsertion + value.substring(position + offset);
        }

        console.log({value, newValue, offset});
        return [
            newValue,
            offset
        ];
    };

    dateDeleteAtPosition = (value, position) => {
        if(position + 1 === value.length) {
            if(position === 4 || position === 7) {
                return [value.substring(0, position - 1), 2];
            }

            return [value.substring(0, position), 1];
        }

        if(position === 4 || position === 7) {
            return [this.dateReplaceAtPosition(value, position - 1, "0")[0], 2]
        }

        if((position === 3 || position === 6) && position + 2 === value.length) {
            return [value.substring(0, position), 1];
        }

        return [this.dateReplaceAtPosition(value, position, "0")[0], 1];
    };

    timeDeleteAtPosition = (value, position) => {
        if(position + 1 === value.length) {
            if(position === 2 || position === 5) {
                return [value.substring(0, position - 1), 2];
            }

            if(position === 7) {
                return [value.substring(0, position - 1), 2];
            }

            return [value.substring(0, position), 1];
        }

        if(position === 2 || position === 5) {
            return [this.timeReplaceAtPosition(value, position - 1, "0")[0], 2];
        }

        if((position === 1 || position === 4 || position === 6) && position + 2 === value.length) {
            return [value.substring(0, position), 1];
        }

        return [this.timeReplaceAtPosition(value, position, "0")[0], 1];
    };

    replaceAtPosition = (value, position, insertion) => {
        // return this.dateReplaceAtPosition(value, position, insertion);
        return this.timeReplaceAtPosition(value, position, insertion);
    };

    deleteAtPosition = (value, position) => {
        // return this.dateDeleteAtPosition(value, position);
        return this.timeDeleteAtPosition(value, position);
    };

    handleChange = event => {
        const {display} = this.state;
        const {target} = event;
        let {value} = target;

        // Get current cursor location
        const cursor = target.selectionStart;

        // Get change start
        const changeStart = cursor > this.selectionStart ? this.selectionStart : cursor;

        // Get change
        const change = value.substring(changeStart, cursor);

        // Cursor offset
        let offset = 0, newValue = display;
        for(let i = 0; i < change.length; i++) {
            let currentOffset;
            [newValue, currentOffset] = this.replaceAtPosition(newValue, changeStart + offset, change[i]);
            offset += currentOffset;
        }

        // Get difference after insertions
        const difference = (change.length - offset) + (display.length - value.length);

        // If there is shortage
        let deleteOffset = 0;
        if(difference > 0) {
            while(deleteOffset < difference) {
                let currentOffset;
                [newValue, currentOffset] = this.deleteAtPosition(newValue, changeStart + offset - deleteOffset + difference - 1);
                deleteOffset += currentOffset;
            }
        }

        const newCursor = deleteOffset ? cursor : changeStart + offset;
        this.setState({display: newValue}, () => {
            target.setSelectionRange(newCursor, newCursor);
        });
    };

    handleSelect = event => {
        const {selectionStart, selectionEnd} = event.target;
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
    };

    render() {
        const {disabled, innerRef, onFocus} = this.props;
        const {display} = this.state;
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
                       onFocus={onFocus} value={display} onChange={this.handleChange} onSelect={this.handleSelect}
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