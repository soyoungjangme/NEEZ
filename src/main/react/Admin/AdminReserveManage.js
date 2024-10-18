import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminReserveManage.css';

function AdminReserveManage() {
    const [passengers, setPassengers] = useState([
        {
            id: 1,
            name: "Clara Smith",
            email: "tranthuy.nute@...",
            phone: "(319) 555-0115",
            airline: "ATLANTA JET Airlines",
            flightStatus: "대 기",
            date: "09/18/23",
            time: "08:40",
            seat: "18F",
            destination: "RDU",
        },
        {
            id: 2,
            name: "Floyd Miles",
            email: "vuahiuthoungnt@...",
            phone: "(405) 555-0128",
            airline: "PEGASUS Airlines",
            flightStatus: "완 료",
            date: "09/18/23",
            time: "09:45",
            seat: "1D",
            destination: "RDU",
        },
        {
            id: 3,
            name: "Jerome Bell",
            email: "manhhackit08@...",
            phone: "(252) 555-0126",
            airline: "UIA Airlines",
            flightStatus: "#5028",
            date: "09/18/23",
            time: "12:37",
            seat: "16A",
            destination: "RDU",
        },
        {
            id: 4,
            name: "Ronald Richards",
            email: "binhan628@...",
            phone: "(208) 555-0112",
            airline: "MONTANA Airways",
            flightStatus: "#5028",
            date: "09/18/23",
            time: "16:45",
            seat: "2E",
            destination: "RDU",
        },
    ]);

    const [viewMode, setViewMode] = useState('calendar');
    const [reservationList, setReservationList] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [displayedDates, setDisplayedDates] = useState([]); // 선택된 날짜를 표시할 상태 추가
    const [startMonth] = useState(new Date());
    const [updatingReservationId, setUpdatingReservationId] = useState(null); // 현재 업데이트 중인 예약 ID
    const [newStatus, setNewStatus] = useState(''); // 새로운 예약 상태

    useEffect(() => {
        axios.get('/adminReservation/getManageList')
            .then(response => {
                console.log(response.data);
                setReservationList(response.data);
            })
            .catch(error => {
                console.log('Error Category', error);
            });
    }, []);

    // 캘린더에 예약건 반환
    const getReservationsForDate = (date) => {
        return reservationList
            .filter(reservation =>
                new Date(reservation.regTime).toLocaleDateString() === date.toLocaleDateString()
            )
            .sort((a, b) => new Date(a.regTime) - new Date(b.regTime));
    };

    const handleDateClick = (date) => {
        const dateString = date.toLocaleDateString();
        setSelectedDates((prevSelected) => {
            if (prevSelected.includes(dateString)) {
                return prevSelected.filter(d => d !== dateString);
            } else {
                return [...prevSelected, dateString];
            }
        });
    };

    // 선택된 날짜를 화면에 띄우고 선택된 날짜 초기화
    const handleShowSelectedDates = () => {
        setDisplayedDates(selectedDates);
        setSelectedDates([]); // 선택된 날짜 초기화
    };

    // 예약 상태 변경
    const handleStatusChange = (reservationNo, status) => {
        if (!status) {
            alert('예약 상태를 선택해야 합니다.');
            return;
        }

        axios.post('/adminReservation/updateStatus', {
            reservationId: reservationNo,
            newStatus: status,
        })
            .then(response => {
                setReservationList(prevList => prevList.map(item =>
                    item.reservationNo === reservationNo ? { ...item, reservationStatus: status } : item
                ));
                setUpdatingReservationId(null); // 업데이트 완료 후 ID 초기화
                setNewStatus(''); // 새로운 상태 초기화
            })
            .catch(error => {
                console.error('Error updating reservation status:', error);
            });
    };

    // 예약 상태 변경 취소 버튼
    const handleCancelUpdate = () => {
        setUpdatingReservationId(null);
        setNewStatus('');
    };

    console.log(reservationList);


    return (
        <div>
            <div className="main-content-title">
                예약 관리
                <div className="icon-buttons">
                    <button className="icon-button calendar-button" onClick={() => setViewMode('calendar')}>
                        <span className="material-symbols-outlined">calendar_today</span>
                    </button>
                    <button className="icon-button list-button" onClick={() => setViewMode('list')}>
                        <span className="material-symbols-outlined">view_list</span>
                    </button>
                </div>
            </div>

            {/* <div className="main-btns">
                <button type="button" className="btn-st" onClick={handleShowSelectedDates}>
                    선택한 날짜
                </button>
            </div> */}

            {/* 선택된 날짜를 버튼 아래에 표시 */}
            {/* {displayedDates.length > 0 && (
                <div className="selected-dates-display">
                    <h4>선택된 날짜:</h4>
                    <ul>
                        {displayedDates.map((date, index) => (
                            <li key={index}>{date}</li>
                        ))}
                    </ul>
                </div>
            )} */}

            <div className="main-contents">
                {viewMode === 'list' ? (
                    <div className="management-container">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>예약 번호</th>
                                    <th>고객 명</th>
                                    <th>예약일</th>
                                    <th>총액</th>
                                    <th>요청사항</th>
                                    <th>예약 상태</th>
                                    <th>상태 변경</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservationList.map((value, index) => (
                                    <tr key={index}>
                                        <td><input type="checkbox" /></td>
                                        <td>{value.reservationNo}</td>
                                        <td>{value.userId}</td>
                                        <td>{value.regTime}</td>
                                        <td>{value.reservationPrice}</td>
                                        <td>{value.customerRequest}</td>
                                        <td>{value.reservationStatus}</td>
                                        <td>
                                            {updatingReservationId === value.reservationNo ? (
                                                <div>
                                                    <select
                                                        value={newStatus}
                                                        onChange={(e) => setNewStatus(e.target.value)}
                                                    >
                                                        <option value="">상태 선택</option>
                                                        {value.reservationStatus !== '대기' && <option value="대기">대기</option>}
                                                        {value.reservationStatus !== '취소' && <option value="취소">취소</option>}
                                                        {value.reservationStatus !== '완료' && <option value="완료">완료</option>}
                                                    </select>
                                                    <button onClick={() => handleStatusChange(value.reservationNo, newStatus)}>업데이트</button>
                                                    <button onClick={handleCancelUpdate}>취소</button>
                                                </div>
                                            ) : (
                                                <button className="flight-btn" onClick={() => setUpdatingReservationId(value.reservationNo)}>
                                                    상태 변경
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="calendar-and-reservation-info">
                        <div className="custom-calendar">
                            <h3>{startMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                            <Calendar
                                onChange={() => { }}
                                value={startMonth}
                                locale="en-US"
                                tileClassName={({ date, view }) => {
                                    if (view === 'month') {
                                        const dateString = date.toLocaleDateString();
                                        if (selectedDates.includes(dateString)) {
                                            return 'selected-date';
                                        }
                                    }
                                    return null;
                                }}
                                tileContent={({ date, view }) => {
                                    if (view === 'month') {
                                        const reservations = getReservationsForDate(date);
                                        if (reservations.length > 0) {
                                            return (
                                                <ul className="reservation-list">
                                                    {reservations.map((reservation) => {
                                                        return (
                                                            <li key={reservation.reservationNo}>
                                                                {reservation.reservationTime} <br /> {reservation.userId} <br />{reservation.reservationStatus}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            );
                                        }
                                    }
                                    return null;
                                }}
                                onClickDay={handleDateClick}
                            />
                        </div>

                        {/* 선택된 날짜가 있을 때만 예약 정보 리스트 표시 */}
                        {selectedDates.length > 0 && (
                            <div className="reservation-info-container">
                                <h3>예약 정보</h3>
                                {selectedDates.map((dateString, index) => (
                                    <div key={index}>
                                        <h4>{dateString}</h4>
                                        <ul>
                                            {getReservationsForDate(new Date(dateString)).map(reservation => (
                                                <li key={reservation.reservationNo}>
                                                    <strong>예약번호:</strong> {reservation.reservationNo} <br />
                                                    <strong>예약상태:</strong> {reservation.reservationStatus} <br />
                                                    <strong>예약시간:</strong> {reservation.reservationTime} <br />
                                                    <strong>예약등록일시:</strong> {reservation.regTime} <br />
                                                    <strong>요청사항:</strong> {reservation.customerRequest} <br />
                                                    <strong>총액:</strong> {reservation.reservationPrice} <br />
                                                    <strong>업체아이디:</strong> {reservation.storeId} <br />
                                                    <strong>사용자아이디:</strong> {reservation.userId} <br />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                )}

            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AdminReserveManage />
);