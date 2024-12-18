import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import './TermsOfUse.css';
import './StoreInfo.css';
import './StoreRegistComplete.css';


function StoreSignUp() {
    const inputRef = useRef(null); // input 요소를 참조할 ref 생성
    const [termsCheck, setTermsCheck] = useState(false); //이용약관동의
    const [privacyCheck, setPrivacyCheck] = useState(false); //개인정보동의
    const [currentStep, setCurrentStep] = useState(1); // 현재 스텝 상태
    const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,13}$/;
    const businessNoRegex = /^\d{10}$/;
    const storeCallRegex = /^(\d{2,3})-(\d{3,4})-(\d{4})$/;

    //step02
    const [storeInfoData, setStoreInfoData] = useState ({
        storeId:'',
        storePw:'',
        storeCate:'',
        storeName:'',
        storeMaster:'',
        managerName:'',
        managerPhone:'',
        storeBusinessNo:'',
        zipcode: '',
        addr:'',
        addrdetail:'',
        deliveryType: ''
    });

    // 스텝증가
    const handleClickNext = () => {

        if(termsCheck === false || privacyCheck === false){
            alert('약관에 모두 동의해주십시오.');
            return;
        }else{
            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    // 스텝감소
    const handleGoBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const [idError, setIdError] = useState('');
    const [pwError, setPwError] = useState('');
    const [businessNoError, setBusinessNoError] = useState('');
    const [managerPhoneError, setManagerPhoneError] = useState('');
    const [isIdValid, setIsIdValid] = useState(false);
    const [isPwValid, setIsPwValid] = useState(false);
    const [isBusinessNoValid, setIsBusinessNoValid] = useState(false);
    const [isManagerPhone, setIsManagerPhon] = useState(false);

    //step02 - input상태값 저장
    const handleChangeStore = (e) => {
        const { id, value } = e.target;

        if (id === "storeId") {
            setIsDuplicate(null);
            setStoreInfoData({ ...storeInfoData, storeId: value });
            setIsIdValid(idRegex.test(value));
            setIdError(idRegex.test(value) ? "" : "아이디는 최소 5자 이상의 영문과 숫자로 입력해 주세요.");
        } else if (id === "storePw") {
            setStoreInfoData({ ...storeInfoData, storePw: value });
            setIsPwValid(pwRegex.test(value));
            setPwError(pwRegex.test(value) ? "" : "비밀번호는 영문, 숫자, 특수문자를 포함해 8~13자 이내로 입력해 주세요.");
        } else if (id === "storeBusinessNo"){
            setStoreInfoData({ ...storeInfoData, storeBusinessNo: value });
            setIsBusinessNoValid(businessNoRegex.test(value));
            setBusinessNoError(businessNoRegex.test(value) ? "" : "10자리를 입력해 주세요.");
        } else if (id === "managerPhone"){
            setStoreInfoData({ ...storeInfoData, managerPhone: value});
            setIsManagerPhon(storeCallRegex.test(value));
            setManagerPhoneError(storeCallRegex.test(value) ? "" : "전화번호를 다시 확인해 주세요.")
        }


        setStoreInfoData({
            ...storeInfoData,
            [id]: value // id 속성에 해당하는 값을 동적으로 업데이트
        });
    };

    //id중복체크
    const [isDuplicate, setIsDuplicate] = useState(null);

    const handleDuplicatedId = async() => {
        try{
            if(isIdValid){

                const response = await axios.post('/adminStore/duplicatedIdCheck', {storeId: storeInfoData.storeId});

                if (response.data > 0) { // 중복된 경우
                    setIsDuplicate(true);
                    inputRef.current.focus(); // input 요소에 포커스 주기
                } else {
                    setIsDuplicate(false); // 중복되지 않은 경우
                }
            }
        } catch (error) {
            console.log("중복검사실패 ", error);
            alert('아이디 중복 검사 중 오류 발생');
        }
    };

    // Ref를 사용하여 입력 필드에 접근합니다.
    const postcodeRef = useRef(null);
    const addressRef = useRef(null);
    const detailAddressRef = useRef(null);
    const extraAddressRef = useRef(null);

    // 우편번호 검색 기능
    const openPostcode = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                let addr = ''; // 주소 변수
                let extraAddr = ''; // 참고항목 변수

                // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 도로명 주소 선택
                    addr = data.roadAddress;
                } else { // 지번 주소 선택
                    addr = data.jibunAddress;
                }

                // 도로명 주소일 경우 참고항목 추가
                if (data.userSelectedType === 'R') {
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')';
                    }
                }

                // 주소정보설정
                setStoreInfoData(prevData => ({
                    ...prevData,
                    zipcode: data.zonecode,
                    addr: addr,
                    addrdetail: ''
                }));

                // 상세주소 필드로 커서 이동
                detailAddressRef.current.focus();
            }
        }).open();
    };

    //주차여부
    const handleChangeParking = (e) => {
        const { value } = e.target;

        setStoreInfoRegistData(prevData => ({
            ...prevData,  // prevData를 펼치고 새 객체로 만듭니다.
            storeParkingYn: value // parking 속성을 업데이트합니다.
        }));
    };

    useEffect (() => {
        console.log("step02 ",storeInfoData);
    },[storeInfoData]);


    //등록하기
    const handleStoreRegist = async() => {
        try {
            if(isDuplicate === true || isDuplicate === null){
                alert('아이디 중복체크를 해주세요.');
                inputRef.current.focus();
                return;
            }

            if(isIdValid === false || isPwValid === false){
                alert('아이디와 비밀번호를 확인해주세요.');
                inputRef.current.focus();
                return;
            }

            // 빈 필드 검사
            const firstEmptyField = Object.entries(storeInfoData).find(([key, value]) => !value.trim());

            // 필드 이름 한글 매핑
            const fieldNames = {
                storeId: '아이디',
                storePw: '비밀번호',
                storeCate: '업종',
                storeName: '상호명',
                storeMaster: '대표자명',
                managerName: '담당자명',
                managerPhone: '휴대전화번호',
                storeBusinessNo: '사업자번호',
                zipcode: '우편번호',
                addr: '주소',
                addrdetail: '상세주소',
            };

            if (firstEmptyField) {
                const fieldName = fieldNames[firstEmptyField[0]] || firstEmptyField[0];
                alert(`${fieldName} 입력을 완료해주십시오.`);
                return;
            }

            const response = await axios.post('/adminStore/registStore',{
                ...storeInfoData
            });

            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            }
            console.log('성공 ', response.data);
        } catch (error){
            console.error('error ', error);
        }
    };

    return (
    <div className="admin-body">
        {/*Step Indicator*/}
        <div className="step-indicator">
            <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                <div className="icon">
                <p>STEP 01<br/>이용약관/개인정보방침 동의</p>
                </div>
            </div>
            <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                <div className="icon">
                <p>STEP 02<br/>신규등록</p>
                </div>
            </div>
            <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                <div className="icon">
                <p>STEP 03<br/>가입완료</p>
                </div>
            </div>
        </div>

        {/* step 01 약관동의 */}
        {currentStep === 1 &&(
            <div className="admin-termsofuse-container">
                <div className="container">
                    <div className="terms-section">
                        <input type="checkbox" id="terms" name="terms" checked={termsCheck} onChange={() => setTermsCheck(!termsCheck)}/>
                        <label htmlFor="terms">이용약관 동의</label>
                        <textarea disabled>
    제1조. 목적
    이 약관은 니즈(이하 "당사"라 합니다)가 운영하는 www.NEEZ.com에서 제공하는 인터넷 관련 서비스(이하 "서비스"라 합니다)와 당사가 운영하는 사이버 쇼핑몰(이하 "쇼핑몰"이라 함)의 이용에 있어 당사와 이용자의 권리·의무 및 책임사항을 규정하여 고객 권익을 보호함을 목적으로 합니다.

    이용자가 되고자 하는 자가 당사가 정한 소정의 절차를 거쳐서 "등록하기" 단추를 누르면 본 약관에 동의하는 것으로 간주합니다. 본 약관에 정하는 이외의 이용자와 당사의 권리, 의무 및 책임사항에 관해서는 전기통신사업법 기타 대한민국의 관련 법령과 상관습에 의합니다.

    제2조. 정의
    "이용자"란에 접속하여 본 약관에 따라 회원으로 가입하여 당사가 제공하는 서비스를 받는 자를 말합니다.

    "쇼핑몰" 이란 당사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터등 정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 쇼핑몰을 운영하는 당사의 의미로도 사용합니다.

    "회원"이라 함은 "쇼핑몰"에 개인정보를 제공하여 회원등록을 한 자로서, "쇼핑몰"의 정보를 지속적으로 제공받으며, "쇼핑몰"이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

    "비회원"이라 함은 회원에 가입하지 않고 "쇼핑몰"이 제공하는 서비스를 이용하는 자를 말합니다.

    제3조. 회원정보
    이용자가 되고자 하는 자는 당사가 정한 가입 양식에 따라 회원정보를 기입하고 "등록하기" 단추를 누르는 방법으로 회원 가입을 신청합니다.

    당사는 제1항과 같이 회원으로 가입할 것을 신청한 자가 다음 각 호에 해당하지 않는 한 신청한 자를 회원으로 등록합니다.

    1) 가입신청자가 본 약관 제4조 제3항에 의하여 이전에 회원자격을 상실한 적이 있는 경우. 다만 제4조 제3항에 의한 회원자격 상실 후 3년이 경과한 자로서 당사의 회원재가입 승낙을 얻은 경우에는 예외로 합니다.

    2) 등록 내용에 허위, 기재누락, 오기가 있는 경우

    3) 기타 회원으로 등록하는 것이 당사의 기술상 현저히 지장이 있다고 판단되는 경우 회원가입계약의 성립시기는 당사의 승낙이 가입신청자에게 도달한 시점으로 합니다.

    회원은 제1항의 회원정보 기재 내용에 변경이 발생한 경우, 즉시 변경사항을 정정하여 기재하여야 합니다.

    제4조. 이용자 탈퇴 및 자격 상실 등
    이용자는 당사에 언제든지 자신의 회원 등록을 말소해 줄 것(이용자 탈퇴)을 요청할 수 있으며 당사는 위 요청을 받은 즉시 해당 이용자의 회원 등록 말소를 위한 절차를 밟습니다.

    이용자가 다음 각 호의 사유에 해당하는 경우, 당사는 이용자의 회원자격을 적절한 방법으로 제한 및 정지, 상실시킬 수 있습니다.

    1) 가입 신청 시에 허위 내용을 등록한 경우

    2) 다른 사람의 "서비스"나 "쇼핑몰" 이용을 방해하거나 그 정보를 도용하는 등 전자거래질서를 위협하는 경우

    3) "서비스"나 "쇼핑몰"을 이용하여 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우

    4) "쇼핑몰"을 이용하여 구입한 재화·용역 등의 대금, 기타 "쇼핑몰" 이용에 관련하여 회원이 부담하는 채무를 기일에 지급하지 않는 경우

    당사가 이용자의 회원자격을 상실시키기로 결정한 경우에는 회원등록을 말소합니다. 이 경우 이용자인 회원에게 회원등록 말소 전에 이를 통지하고, 소명할 기회를 부여합니다.

    "이용자"가 본 약관에 의해서 회원 가입 후 "서비스"를 이용하는 도중, 연속하여 3개월 동안 "서비스"를 이용하기 위해 log-in한 기록이 없는 경우, 당사는 이용자의 회원자격을 정지 또는 상실 시킬 수 있습니다.

    제5조. 이용자에 대한 통지
    당사가 회원에 대한 통지를 하는 경우, 회원이 당사에 제출한 전자우편 주소로 할 수 있습니다.

    당사가 불특정다수 회원에 대한 통지의 경우 1주일이상 "서비스" 게시판에 게시함으로서 개별 통지에 갈음할 수 있습니다.

    제6조. 서비스의 제공 및 변경
    당사는 이용자에게 아래와 같은 서비스를 제공합니다.

    1) 온라인 컨설팅

    2) 이메일 공지 또는 e-zine 서비스

    3) 재화 또는 용역에 대한 정보 제공 및 구매계약의 체결

    4) 구매계약이 체결된 재화 또는 용역의 배송

    5) 기타 당사가 회원에게 제공할 일체의 서비스

    당사는 재화의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화·용역의 내용을 변경할 수 있습니다. 이 경우에는 변경된 재화·용역의 내용 및 제공일자를 명시하여 현재의 재화·용역의 내용을 게시한 곳에 그 제공일자 이전 7일부터 공지합니다.

    당사가 제공하기로 이용자와 계약을 체결한 서비스의 내용을 재화의 품절 또는 기술적 사양의 변경 등의 사유로 변경할 경우에는 당사는 이로 인하여 이용자가 입은 손해를 배상합니다. 단, 당사에 고의 또는 과실이 없는 경우에는 그러하지 아니합니다.

    당사는 그 변경될 서비스의 내용 및 제공일자를 제5조 제1항에서 정한 방법으로 이용자에게 통지하고, 제1항에 정한 서비스를 변경하여 제공할 수 있습니다.

    제7조. 서비스의 중단
    당사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에 서비스의 제공을 예고 없이 일시적으로 중단할 수 있으며 당사가 적절하다고 판다하는 사유에 기하여 제공되는 서비스를 예고 없이 완전히 중단할 수 있습니다.

    제8조. 구매신청
    "쇼핑몰"이용자는 "쇼핑몰"상에서 이하의 방법에 의하여 구매를 신청합니다.

    1) 성명, 주소, 전화번호 입력

    2) 재화 또는 용역의 선택

    3) 결제방법의 선택

    4) 본 약관에 동의한다는 표시 (예, 마우스클릭 등)

    제9조. 계약의 성립
    당사는 제8조와 같은 구매신청에 대하여 다음 각 호에 해당하지 않는 한 승낙합니다.

    1) 신청 내용에 허위, 기재누락, 오기가 있는 경우

    2) 미성년자가 담배, 주류등 청소년보호법에서 금지하는 재화 및 용역을 구매하는 경우

    3) 기타 구매신청에 승낙하는 것이 당사의 기술상 현저히 지장이 있다고 판단하는 경우

    당사의 승낙이 제11조 제1항의 수신확인통지형태로 이용자에게 도달한 시점에 계약이 성립한 것으로 봅니다.

    제10조. 지급방법
    "쇼핑몰"에서 구매한 재화 또는 용역에 대한 대금지급방법은 다음 각 호의 하나로 할 수 있습니다. 단, 이의 운영방식은 회사가 정한 바에 의합니다.

    1) 계좌이체

    2) 신용카드결제

    3) 온라인무통장입금

    4) 전자화폐에 의한 결제

    5) 기타 방식에 의한 결제 등

    제11조. 수신확인통지·구매신청 변경 및 취소
    당사는 이용자의 구매신청이 있는 경우 이용자에게 수신확인통지를 합니다.

    수신확인통지를 받은 이용자는 의사표시의 불일치등이 있는 경우에는 수신확인통지를 받은 후 즉시 구매신청 변경 및 취소를 요청할 수 있습니다.

    당사는 배송 전 이용자의 구매신청 변경 및 취소 요청이 있는 때에는 지체없이 그 요청에 따라 처리합니다.

    제12조. 배송
    당사는 이용자가 구매한 재화에 대해 배송수단, 수단별 배송비용 부담자, 수단별 배송기간 등을 명시합니다. 만약 당사의 고의·과실로 약정 배송기간을 초과한 경우에 그로 인한 이용자의 손해를 배상합니다.

    제13조. 환급, 반품 및 교환
    당사는 이용자가 구매신청한 재화 또는 용역이 품절 등의 사유로 재화의 인도 또는 용역의 제공을 할 수 없을 때에는 지체없이 그 사유를 이용자에게 통지하고, 사전에 재화 또는 용역의 대금을 받은 경우에는 대금을 받은 날부터 3일 이내에, 그렇지 않은 경우에는 그 사유발생일로부터 3일 이내에 계약해제 및 환급절차를 취합니다.

    다음 각 호의 경우에는 당사는 배송된 재화일지라도 재화를 반품받은 다음 영업일 이내에 이용자의 요구에 따라 즉시 환급, 반품 및 교환 조치를 합니다. 다만 그 요구기한은 배송된 날로부터 20일 이내로 합니다.

    1) 배송된 재화가 주문내용과 상이하거나 "쇼핑몰"이 제공한 정보와 상이할 경우

    2) 배송된 재화가 파손, 손상되었거나 오염되었을 경우

    3) 재화가 광고에 표시된 배송기간보다 늦게 배송된 경우

    4) 방문판매등에관한법률 제18조에 의하여 광고에 표시하여야 할 사항을 표시하지 아니한 상태에서 이용자의 청약이 이루어진 경우

    제14조. 이용자의 개인정보보호
    당사는 이용자의 정보수집 시 '인종 및 민족', '출신 및 본적지' 등 기본적 인권을 침해할 우려가 있는 민감한 개인정보의 수집을 엄격히 제한하고 있으며 구매계약 이행에 필요한 최소한의 정보를 수집하되, 다음 사항을 필수사항으로 하고, 그 외 사항은 선택사항으로 합니다.

    1) 성명

    2) 주민등록번호 (회원의 경우)

    3) 주소

    4) 전화번호

    5) 희망ID (회원의 경우)

    6) 비밀번호 (회원의 경우)

    7) email

    당사는 이용자의 개인식별이 가능한 개인정보를 수집하는 때에는 반드시 당해 이용자의 동의를 받습니다.

    제공된 개인정보는 당해 이용자의 동의 없이 목적 외의 이용이나 제3자에게 제공할 수 없으며, 이에 대한 모든 책임은 당사가 집니다. 다만, 다음과 같은 경우에는 예외로 합니다.

    1) 배송업무상 배송업체에게 배송에 필요한 최소한의 이용자의 정보(성명, 주소, 전화번호)를 알려주는 경우

    2) 통계작성, 학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 식별할 수 없는 형태로 제공하는 경우 당사가 제2항과 제3항에 의해 이용자의 동의를 받아야 하는 경우에는 개인정보관리 책임자의 신원(소속, 성명 및 전화번호 기타 연락처), 정보의 수집목적 및 이용목적, 제3자에 대한 정보제공 관련사항(제공받는자, 제공목적 및 제공할 정보의 내용)등 정보통신망이용촉진등에관한법률 제16조제3항이 규정한 사항을 미리 명시하거나 고지해야 하며 이용자는 언제든지 이 동의를 철회할 수 있습니다.

    이용자는 언제든지 당사가 가지고 있는 자신의 개인정보에 대해 열람 및 오류정정을 요구할 수 있으며 당사는 이에 대해 지체없이 필요한 조치를 취할 의무를 집니다. 이용자가 오류의 정정을 요구한 경우에는 당사는 그 오류를 정정할 때까지 당해 개인정보를 이용하지 않습니다.

    당사는 개인정보 보호를 위하여 관리자를 한정하여 그 수를 최소화하며 신용카드, 은행계좌 등을 포함한 이용자의 개인정보의 분실, 도난, 유출, 변조 등으로 인한 이용자의 손해에 대하여 모든 책임을 집니다.

    당사 또는 그로부터 개인정보를 제공받은 제3자는 개인정보의 수집목적 또는 제공받은 목적을 달성한 때에는 당해 개인정보를 지체없이 파기합니다.

    제15조 당사의 의무
    당사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 안정적으로 재화·용역을 제공하기 위해서 노력합니다.

    당사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 구축합니다.

    당사는 이용자가 서비스를 이용함에 있어 당사의 고의 또는 중대한 과실로 인하여 입은 손해를 배상할 책임을 부담합니다.

    제16조 이용자의 ID 및 비밀번호에 대한 의무
    당사가 관계법령, 제14조에 의해서 그 책임을 지는 경우를 제외하고, 자신의 ID와 비밀번호에 관한 관리책임은 각 이용자에게 있습니다.

    이용자는 자신의 ID 및 비밀번호를 제3자에게 이용하게 해서는 안됩니다.

    이용자는 자신의 ID 및 비밀번호를 도난당하거나 제3자가 사용하고 있음을 인지한 경우에는 바로 당사에 통보하고 당사의 안내가 있는 경우에는 그에 따라야 합니다.

    제17조. 이용자의 의무
    이용자는 다음 각 호의 행위를 하여서는 안됩니다.

    1) 회원가입신청 또는 변경시 허위내용을 등록하는 행위

    2) 당사에 게시된 정보를 변경하는 행위

    3) 당사 기타 제3자의 인격권 또는 지적재산권을 침해하거나 업무를 방해하는 행위

    4) 다른 회원의 ID를 도용하는 행위

    5) 정크메일(junk mail), 스팸메일(spam mail), 행운의 편지(chain letters), 피라미드 조직에 가입할 것을 권유하는 메일, 외설 또는 폭력적인 메시지·화상·음성 등이 담긴 메일을 보내거나 기타 공서양속에 반하는 정보를 공개 또는게시하는 행위.

    6) 관련 법령에 의하여 그 전송 또는 게시가 금지되는 정보(컴퓨터 프로그램 등)의 전송 또는 게시하는 행위

    7) 당사의 직원이나 당사 서비스의 관리자를 가장하거나 사칭하여 또는 타인의 명의를 모용하여 글을 게시하거나 메일을 발송하는 행위

    8) 컴퓨터 소프트웨어, 하드웨어, 전기통신 장비의 정상적인 가동을 방해, 파괴할 목적으로 고안된 소프트웨어 바이러스, 기타 다른 컴퓨터 코드, 파일, 프로그램을 포함하고 있는 자료를 게시하거나 전자우편으로 발송하는 행위

    9) 스토킹(stalking) 등 다른 이용자를 괴롭히는 행위

    10) 다른 이용자에 대한 개인정보를 그 동의 없이 수집,저장,공개하는 행위

    11) 불특정 다수의 자를 대상으로 하여 광고 또는 선전을 게시하거나 스팸메일을 전송하는 등의 방법으로 당사의 서비스를 이용하여 영리목적의 활동을 하는 행위

    12) 당사가 제공하는 서비스에 정한 약관 기타 서비스 이용에 관한 규정을 위반하는 행위

    제1항에 해당하는 행위를 한 이용자가 있을 경우 당사는 본 약관 제4조 제2, 3항에서 정한 바에 따라 이용자의 회원자격을 적절한 방법으로 제한 및 정지, 상실시킬 수 있습니다.

    이용자는 그 귀책사유로 인하여 당사나 다른 이용자가 입은 손해를 배상할 책임이 있습니다.

    제18조. 공개게시물의 삭제
    이용자의 공개게시물의 내용이 다음 각 호에 해당하는 경우 당사는 이용자에게 사전 통지 없이 해당 공개게시물을 삭제할 수 있고, 해당 이용자의 회원 자격을 제한, 정지 또는 상실시킬 수 있습니다.

    1) 다른 이용자 또는 제3자를 비방하거나 중상 모략으로 명예를 손상시키는 내용

    2) 공서양속에 위반되는 내용의 정보, 문장, 도형 등을 유포하는 내용

    3) 범죄행위와 관련이 있다고 판단되는 내용

    4) 다른 이용자 또는 제3자의 저작권 등 기타 권리를 침해하는 내용

    5) 기타 관계 법령에 위배된다고 판단되는 내용

    제19조. 저작권의 귀속 및 이용제한
    당사가 작성한 저작물에 대한 저작권 기타 지적재산권은 당사에 귀속합니다. 이용자는 당사를 이용함으로써 얻은 정보를 당사의 사전승낙 없이 복제, 전송, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.

    제20조. 연결"쇼핑몰"과 피연결"쇼핑몰" 간의 관계
    상위 "쇼핑몰"과 하위 "쇼핑몰"이 하이퍼 링크(예: 하이퍼 링크의 대상에는 문자, 그림 및 동화상 등이 포함됨)방식 등으로 연결된 경우, 전자를 "연결 쇼핑몰"(웹 사이트)이라고 하고 후자를 "피연결 쇼핑몰"(웹사이트)이라고 합니다.

    "연결 쇼핑몰"은 "피연결 쇼핑몰"이 독자적으로 제공하는 재화·용역에 의하여 이용자와 행하는 거래에 대하여는 그 거래에 대한 보증책임을 지지 않는다는 내용을 쇼핑몰의 게시판을 통해 공지하며, 이 경우 당해 거래로 발생한 문제에 대하여 "연결 쇼핑몰"은 보증책임을 지지 않습니다.

    제21조. 약관의 개정
    당사는 본 약관의 규제등에관한법률, 전자거래기본법, 전자서명법, 정보통신망이용촉진등에관한법률, 방문판매등에관한법률, 소비자보호법 등 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.

    당사가 본 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 초기화면에 그 적용일자 칠(7일) 이전부터 적용일자 전일까지 공지합니다. 당사가 약관을 개정할 경우에는 개정되는 약관은 그 약관이 적용되는 날 이후에 체결되는 계약에만 적용되고 이전에 이미 체결된 계약에 대해서는 개정 이전의 약관조항이 그대로 적용됩니다. 다만 이미 계약을 체결한 이용자가 개정약관 조항의 적용을 받기를 원하는 뜻을 상기 제2항에서 정한 개정약관의 공지기간 내에 당사에 송신하여 당사의 동의를 받은 경우에는 개정약관 조항이 적용됩니다.

    이 약관에서 정하지 않은 사항과 이 약관의 해석에 관하여는 정부가 제정한 전자거래소비자보호지침 및 관계법령 또는 상관례에 따릅니다.

    제22조. 분쟁해결
    당사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상 담당자를 지정합니다.

    당사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.

    당사와 이용자간에 발생한 분쟁은 전자거래기본법 제28조 및 동 시행령 제15조에 의하여 설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.

    제23조. 재판관할
    당사와 이용자간에 발생한 서비스 이용과 전자거래에 관한 분쟁에 대하여는 대한민국 법을 적용하며, 본 분쟁으로 인한 소송은 민사소송법상의 관할을 가지는 대한민국의 법원에 제기합니다.
                        </textarea>
                    </div>

                    <div className="privacy-section">
                        <input type="checkbox" id="privacy" name="privacy" checked={privacyCheck} onChange={() => setPrivacyCheck(!privacyCheck)}/>
                        <label htmlFor="privacy">개인정보취급방침 동의</label>
                        <textarea disabled>
    대한민국 국민은 누구나 사생활의 비밀 및 통신상의 비밀을 보호받을 수 있는 권리가 있음이 헌법상에 명시되어 있습니다. 그러나 개인의 사생활에 대한 기본 정보가 공공연하게 유출되어 개인의 사생활 침해 사례가 빈번하게 이루어 지고 있는 것이 현실입니다. 따라서 엔티켓은 어떠한 경우에도 회원님의 개인 사생활이 침해 당하는 경우가 없도록 회원님의 개인 정보 보호를 위하여 정부의 기본적인 정책,법률을 충실히 이행하고 있음을 다음과 같이 명시합니다.


    엔티켓의 개인 정보 보호정책은 정부의 시책 및 법률,당사의 정책에 의하여 변경 될 수 있습니다. 티켓링크를 이용하는 회원님 및 고객께서는 수시로 방문하셔서 확인하시고 추가 및 변경 사항에 대하여 참고하시기 바랍니다.

    1. 개인정보 수집 및 이용 목적
    2. 개인정보 수집 방법 및 수집 항목
    3. 개인정보 보유 및 폐기
    4. 개인정보 열람,정정,삭제 및 의견 수렴
    5. 개인정보 제 3자 제공 및 공유
    6. 쿠키(cookie)의 운용 및 활용
    7. 개인정보보호를 위한 기술 및 제도적 장치
    8. 아동의 개인정보 보호
    9. 개인정보 관리 책임 및 담당자

    개인정보 수집 및 이용목적
    엔티켓이 개인정보를 수집하는 목적은 회원님에 대한 최상의 서비스를 제공하기 위함입니다. 수집된 개인 정보는 엔티켓에서 제공하는 티켓 예매 및 기타 상품등에 대한 서비스를 제공하기 위한 계약성립 (본인식별 및 본인확인 등),서비스의 이행(상품 배송 및 결재,환불 등),기타 부가 서비스 (신상품,이벤트 정보,신규 서비스 등)등 회원님의 권리를 위한 서비스 제공을 위하여 사용됩니다. 개인정보의 이용 목적 이외의 다른 용도 또는 회원님의 동의 없이 제 3자에 대한 정보 제공 및 티켓링크의 과실에 따른 개인 정보 유출로 인한 회원님의 피해에 대하여 모든 책임은 엔티켓이 집니다.

    개인정보 수집방법 및 수집항목
    엔티켓은 최초 회원님이 가입시 엔티켓의 티켓 및 상품 구매시 본인 확인 및 상품 전달,구매 및 변경 내역 전달을 위해 필요한 최소한의 필수 기본 정보를 회원님의 동의하에 받고 있습니다. 기본정보는 이름,주민등록번호,연락처,주소,이메일 등입니다.또한 회원님에 대한 맞춤 서비스를 제공하기 위하여 부가정보인 생년월일,선호장르,직업등에 대한 정보를 추가적으로 요청합니다. 부가정보는 회원님의 선택 사항입니다. 엔티켓은 회원이 아닌 비 회원에 대하여도 상품 구매시 서비스 제공을 위하여 상기의 필수 기본 정보를 요청합니다. 비 회원에 대한 개인정보도 회원 개인 정보 보호 정책과 동일하게 보호됩니다. 엔티켓은 제휴 관계가 있는 제휴 회원에 대한 회원 정보를 보유 할 수 있습니다. 이 경우 사전 제휴사의 회원 동의 가 있는 경우에 한하며 회원 정보 는 티켓링크 및 제휴사의 회원 보호 정책에 의하여 보호됩니다 엔티켓은 회원님의 금융 정보에 대하여 보유하지 않으며 필요에 의해 보유하는 금융 정보는 상품 구매자의 환불 요구에 의한 지불 수단을 확인 하기 위하여 도용될 수 없는 범위 (유효기간이 표시되지 않는 신용카드번호)에서만 보유하며 이 또한 엔티켓의 개인 정보 보호 정책에 의해 보호되며 그 보유 목적이 달성되는 시점까지만 보유합니다.

    개인정보 보유 및 폐기
    회원님이 엔티켓의 서비스를 받는동안 개인정보는 엔티켓이 보유합니다. 비 회원의 개인 정보는 제공받는 목적이 달성되는 시기 (상품 배송의 완료 및 기타 제공 서비스에 대한 법률상 그 효력이 만료되는 시점)까지로 한정합니다. 회원님은 엔티켓의 인터넷 또는 전화상으로 회원 탈퇴를 요청 하실 수 있으며 이 경우 엔티켓은 회원님의 정보를 모든 정보 저장장치에서 삭제하며 이 경우 어떠한 용도로도 열람,이용 할 수 없도록 처리됩니다.

    개인정보 열람,정정,삭제 및 의견수렴
    회원님은 언제든지 개인의 정보를 열람,정정,삭제 할 수 있으며 엔티켓의 인터넷 마이페이지의 회원 정보에서 회원님의 개인 정보를 열람,정정 할 수 있으며 마이페이지의 회원 탈퇴 또는 유선상의 본인 확인 절차에 의한 회원탈퇴를 통하여 개인 정보를 삭제 하실 수 있습니다. 또한 개인 정보에 관한 불만이나 의견은 개인 정보 관리 담당자에게 이메일 (@) 또는 전화 (032-818-5721)로 문의하시면 즉시 처리하고 통보해 드리도록 하겠습니다.

    개인정보 제 3자 제공 및 공유
    엔티켓은 회원님의 개인정보를 원칙적으로 제3자에게 제공하거나 공유하지 않습니다. 다만 엔티켓이 회원님의 서비스 개선을 위하여 제3자와 제휴를 통한 개인정보 제공 또는 공유의 경우에도 엔티켓의 회원 약관에 의하여 반드시 회원님의 사전 동의를 받습니다. 사전동의시에 회원님의 개인정보의 제공처,목적,보유기간등을 알려드리며 회원님의 동의가 없는 경우에는 어떠한 경우에도 개인정보를 제공 또는 공유하지 않습니다.단, 엔티켓의 회원약관에 의하여 회원님에게 상품 배송을 위해 제3자에게 성명,주소,연락처를 제공하는 경우와 법률에 따라 해당 기관에 개인 정보를 제공하는 경우에는 사전 동의를 생략합니다.

    쿠키의 운용 및 활용
    회원님이 웹 싸이트의 웹 브라우저 (넷스케이프,익스플로러 등)를 사용하여 엔티켓에 접속시 회원님이 사용하시는 컴퓨터의 하드디스크에 저장되는 소량의 정보입니다.
    회원님이 엔티켓에 접속 후 로그인시에 해당 쿠키에 의하여 회원님의 아이디에 대한 정보를 찾아냅니다.쿠키는 회원님에게 더 편리한 맞춤 서비스를 제공하기 위하여 활용되며 각각의 브라우저에는 고유의 쿠키가 부여되며 회원 및 비 회원에 대한 사용 빈도,방문 형태등을 확인하는데 이용됩니다 쿠키는 회원님의 컴퓨터는 식별하지만 개개인을 식별하지는 않습니다 회원님은 쿠키에 대한 선택의 권한이 있으며 웹 부라우저의 옵션에서 사용자 정의 수준을 선택하시어 쿠키 허용을 조정함으로써 모든 쿠키를 다 받아들이거나,쿠키가 설치될 때 통지를 보내도록 하거나,모든 쿠키를 거부 할 수 있습니다.

    개인정보보호를 위한 기술 및 제도적 장치
    회원님의 개인정보는 비밀번호에 의하여 보호되며,파일 및 전송데이터를 암호화 하거나 파일 잠금 기능(lock)을 사용하여 중요한 데이터는 별도의 보안장치를 통하여 보호하고 있습니다.
    개인정보의 변경,열람,삭제 등은 반드시 회원 본인만 가능하며 티켓링크에서는 회원님의 비밀번호에 의하여 회원을 확인합니다. 따라서 회원님의 비밀번호는 어떠한 경우에도 제3자에게 알려주지 않아야 하며 엔티켓은 어떠한 경우에도 유선,이메일 또는 기타 방법에 의하여 회원님께 비밀번호를 확인하지 않습니다.
    회원님이 비밀번호를 분실하여 엔티켓의 회원 확인 절차에 의하여 유선상으로 비밀번호를 문의하는 경우에는 회원님이 가입 시에 등록하신 이메일로 해당 비밀번호를 알려드립니다.
    회원님은 비밀번호의 관리에 각별한 주의를 하시길 바라며 공공 장소에서 접속시에는 반드시 로그 아웃을 통해 회원님의 개인정보를 보호 하시기 바랍니다.
    엔티켓은 백신 프로그램을 이용하여 컴퓨터 바이러스에 대비하고 있으며 해킹등에 의한 개인정보 보호를 위한 안전 장치를 갖추고 있습니다.또한 엔티켓은 암호알고리즘을 이용하여 네트워크상의 개인정보를 안전하게 전송할 수 있는 보안장치를 채택하고 있습니다. 엔티켓의 개인 정보 취급 인원은 최소한으로 운영하고 있으며 모든 취급자는 개인정보 접속에 따른 상황이 관리되며 정기적인 교육을 통하여 개인정보 관리에 만전을 다하고 있습니다.

    아동의 개인정보 보호
    엔티켓은 만 14세 미만 아동의 보호를 위하여 14세 미만 아동의 경우에는 회원 또는 비 회원으로 가입 또는 상품 구매를 할 수 없도록 하고 있습니다.

    개인정보관리 담당자
    엔티켓은 정보통신부의 개인정보 보호지침에 의거하여 개인정보 관리 책임자 및 담당자를 아래와 같이 지정하여 개인정보를 보호합니다.
                        </textarea>
                    </div>

                    <div className="buttons">
                        <a href="/adminlogin.login" id="gohome">돌아가기</a>
                        <button type="submit" className="next-btn" onClick={handleClickNext} >다음단계 ▶</button>
                    </div>
                </div>
            </div>
        )}





        {/* step 02 신규등록 */}
        {currentStep === 2 && (
            <div className="admin-store-info-container">
                {/* Step Indicator */}
                <div className="account-login-box">
                    {/* User Info Section */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="storeId">아이디</label>
                        <div className="btn-group">
                            <input type="text" id="storeId" value={storeInfoData.storeId} placeholder="아이디 입력" onChange={(e) => handleChangeStore(e)} ref={inputRef}/>
                            <button className="btn-check" onClick={handleDuplicatedId}>중복 체크</button>
                        </div>
                        {idError && <p style={{ color: 'red' }} className="small-text">{idError}</p>}
                        {isIdValid && isDuplicate === true && <p style={{color:'red'}} >이미 사용 중인 아이디입니다.</p>}
                        {isIdValid && isDuplicate === false && <p style={{color:'green'}}>사용 가능한 아이디입니다.</p>}
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="storePw">비밀번호</label>
                            <input type="password" id="storePw" placeholder="비밀번호 입력" onChange={(e) => handleChangeStore(e)}/>
                            {!isPwValid && pwError && <p style={{ color: 'red' }} className="small-text">{pwError}</p>}
                        </div>
                    </div>

                    <div className="account-store-box">
                    {/* Business Info Section */}
                    <div className="input-group">
                        <label htmlFor="category">업종</label>
                        <select id="storeCate" onChange={(e)=>handleChangeStore(e)}>
                            <option value="">업종 선택</option>
                            <option value="디저트">디저트</option>
                            <option value="공예">공예</option>
                            <option value="꽃">꽃</option>
                            <option value="뷰티">뷰티</option>
                            <option value="패션">패션</option>
                            <option value="주얼리">주얼리</option>
                            <option value="디지털">디지털</option>
                            <option value="반려동물">반려동물</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="storeDelivery">배송여부</label>
                        <div className="delivery-group">
                            <input style={{width:'auto'}} type="radio" className="delivery-type" id="deliveryType" value="배송" checked={storeInfoData.deliveryType === '배송'} onChange={(e)=>handleChangeStore(e)} /> <span>배송</span>
                            <input style={{width:'auto'}} type="radio" className="delivery-type" id="deliveryType" value="픽업" checked={storeInfoData.deliveryType === '픽업'}  onChange={(e)=>handleChangeStore(e)}/> <span>픽업</span>
                            <input style={{width:'auto'}} type="radio" className="delivery-type" id="deliveryType" value="배송+픽업" checked={storeInfoData.deliveryType === '배송+픽업'}  onChange={(e)=>handleChangeStore(e)}/> <span>배송 + 픽업</span>
                        </div>
                    </div>





                    <div className="input-group">
                        <label htmlFor="storeName">상호명</label>
                        <input type="text" id="storeName" placeholder="상호명 입력" onChange={(e)=>handleChangeStore(e)} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="storeMaster">대표자명</label>
                        <input type="text" id="storeMaster" placeholder="대표자명 입력" onChange={(e)=>handleChangeStore(e)} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="managerName">담당자명</label>
                        <input type="text" id="managerName" placeholder="담당자명 입력" onChange={(e)=>handleChangeStore(e)} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="managerPhone">업체번호</label>
                        <input type="text" id="managerPhone" placeholder="- 포함하여 입력" onChange={(e)=>handleChangeStore(e)} />
                        {!isManagerPhone && managerPhoneError && <p style={{ color: 'red' }} className="small-text">{managerPhoneError}</p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="address">사업자 주소</label>
                        <div className="btn-group">
                            <input type="text" id="zipcode" value={storeInfoData.zipcode} ref={postcodeRef} placeholder="우편번호" style={{ width: '20%' }} readOnly />
                            <input type="button" className="btn-postcode" onClick={openPostcode} style={{ width: '130px' ,lineHeight: '10px' }} value="우편번호 찾기" />
                        </div>
                        <input type="text" id="addr" value={storeInfoData.addr} ref={addressRef} placeholder="주소" readOnly />
                        <input type="text" id="addrdetail" value={storeInfoData.addrdetail} ref={detailAddressRef} placeholder="상세주소"
                            onChange={(e) =>
                                setStoreInfoData(prevData => ({
                                    ...prevData,
                                    addrdetail: e.target.value
                                }))
                            }
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="storeBusinessNo">사업자등록번호</label>
                        <input type="text" id="storeBusinessNo" placeholder="사업자등록번호 입력" onChange={(e)=>handleChangeStore(e)} />
                        {!isBusinessNoValid && businessNoError && <p style={{ color: 'red' }} className="small-text">{businessNoError}</p>}
                    </div>
                </div>

                <div className="buttons">
                    <button type="button" className="cancel-btn" onClick={handleGoBack}>◀ 이전</button>
                    <button type="submit" className="next-btn" onClick={handleStoreRegist} disabled={!isIdValid || !isPwValid || !isBusinessNoValid} >등록하기 ▶</button>
                </div>
            </div>
        )}


        {/* step03 가입완로 */}
        {currentStep === 3 && (
            <div className="admin-store-regist-container">
                {/* Main Form */}
                <div className="admin-singup-complete-container">
                    <div className="singup-complete-title">
                    <i className="bi bi-check-circle-fill"></i> 회원 가입 완료
                    </div>

                    <div className="singup-complete-content">
                        <div>
                            <span> {storeInfoData.storeName} </span> 승인 대기 중 ...
                        </div>
                        <div>
                            * 회원가입 내역 확인 및 수정은 <span>마이페이지</span>에서 확인 가능합니다.
                        </div>
                    </div>

                    <button type="button" className="login-go-btn" onClick={() => { location.href = '/adminlogin.login';}}> 로그인하기 </button>
                </div>
            </div>
        )}
    </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StoreSignUp />
);

