import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleSelectAll,
  toggleBrand,
  toggleProduct,
  setCartItems,
  setSelectedProducts,
  removeSelectedItems, // 추가
} from "../../store/slice/cartSlice";
import Cart_top from "./Cart_top";
import Cart_bottom from "./Cart_bottom";
import BrandSection from "./BrandSection";
import DeleteModal from "./DeleteModal";
import "./Cart.css";

function Cart() {
  // 로그인

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  //네비게이터
  const navigate = useNavigate();
  //리덕스
  const dispatch = useDispatch();
  const selectedAll = useSelector((state) => state.cart.selectedAll); // cart 슬라이스에서 selectedAll 가져오기
  const selectedBrands = useSelector((state) => state.cart.selectedBrands);
  const selectedProducts = useSelector((state) => state.cart.selectedProducts);
  const cartItems = useSelector((state) => state.cart.cartItems); // Redux 상태에서 장바구니 아이템 가져오기
  const totalPrice = useSelector((state) => state.cart.totalPrice);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const userId = 1;
  // const userId = useSelector((state) => state.auth.userId);

  //모달관련
  const [isModalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => {
    if (selectedProducts.length > 0) {
      setModalOpen(true); // 선택된 제품이 있을 때만 모달 열기
    }
  };
  const handleCloseModal = () => setModalOpen(false);
  const [deleteProductId, setDeleteProductId] = useState(null); // 삭제할 제품 ID 상태
  //주문페이지로의 전송
  const selectedItems = useSelector((state) => state.cart.selectedProducts); // 선택된 상품 목록
  /*
  useEffect(() => {
    // 해당 페이지 최초 랜더링시 로그인 된 상태면? 바로 비동기적으로 제품정보들을 가져온다?
    
    const fetchData = async () => {
      const response = await fetch("/api/products"); // 예시 API
      const data = await response.json();
      setProducts(data);
    };
    if(isAuthenticated){
    fetchData();
}}, [setProducts]);
  */
  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://52.78.168.169/cart/${userId}`);

      if (!response.ok) {
        throw new Error("서버에서 데이터를 가져오는 데 실패했습니다.");
      }

      const data = await response.json();
      console.log(data);

      dispatch(setCartItems(data)); // Redux 상태에 장바구니 아이템 설정
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [dispatch, userId]);

  const groupedCartItems = cartItems.reduce((acc, item) => {
    (acc[item.username] = acc[item.username] || []).push(item);
    return acc;
  }, {});

  const moveHomePage = () => {
    console.log("홈페이지 이동");
    navigate("/");
  };
  const moveLogin = () => {
    console.log("로그인페이지 이동");
    // navigate("/login");
  };

  // 체크박스관련?
  const handleSelectAll = () => {
    dispatch(toggleSelectAll());
  };

  const handleBrandSelect = (brand) => {
    dispatch(toggleBrand(brand));
  };

  const handleProductSelect = (productId) => {
    dispatch(toggleProduct(productId));
  };

  const handleConfirmDelete = async () => {
    const productsToDelete = deleteProductId
      ? [deleteProductId]
      : selectedProducts;

    if (productsToDelete.length === 0) return;

    try {
      // 선택된 제품들의 cartId를 하나씩 삭제 요청
      for (const cartId of productsToDelete) {
        await fetch(`http://52.78.168.169/cart/item/${cartId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      console.log("삭제 성공");
      fetchCartItems(); // 장바구니 목록 갱신
      handleCloseModal(); // 모달 닫기
      setDeleteProductId(null); // 단일 제품 삭제 상태 초기화
    } catch (error) {
      console.error("삭제 요청 실패:", error);
    }
  };

  // const handleConfirmDelete = () => {
  //   if (deleteProductId) {
  //     // 특정 제품 삭제
  //     dispatch(removeSelectedItems(deleteProductId)); // 특정 제품 ID를 전달
  //   } else if (selectedProducts.length > 0) {
  //     // 여러 제품 삭제
  //     dispatch(removeSelectedItems()); // 선택된 제품 삭제
  //   }
  //   handleCloseModal(); // 모달 닫기
  // };
  const handleOpenModalForSingleDelete = (productId) => {
    setDeleteProductId(productId); // 삭제할 제품 ID 설정
    setModalOpen(true); // 모달 열기
  };

  const handlePurchaseClick = () => {
    if (totalQuantity > 0) {
      // selectedProducts에서 productId를 이용해 해당 제품 객체를 가져옵니다.
      const selectedProductObjects = selectedProducts
        .map((productId) => {
          return cartItems.find((item) => item.productId === productId);
        })
        .filter((item) => item !== undefined); // find가 실패한 경우를 대비해 필터링

      dispatch(setSelectedProducts(selectedProductObjects)); // 객체 배열을 디스패치
      console.log(selectedProductObjects); // 콘솔에 확인

      navigate("/order");
    } else {
      alert("구매할 상품을 선택해주세요.");
    }
  };
  return (
    <div className="all">
      <Cart_top />

      <div className={`${!isAuthenticated ? "cart_no_result" : ""} `}>
        <div className={`${!isAuthenticated ? "vertical_alignment" : "hide"} `}>
          <div style={{ fontWeight: "bold", marginBottom: "7px" }}>
            장바구니에 담은 상품이 없어요
          </div>
          <div style={{ color: "#666666" }}>상품을 추가해보세요.</div>
          <div className="movelogin_btn" onClick={moveLogin}>
            로그인하러 가기
          </div>
        </div>
        <div className={`${isAuthenticated ? "로그인 시 출력" : "hide"}`}>
          <div className="allcheck">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedAll}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAll">전체선택</label>
            <div onClick={handleOpenModal} style={{ cursor: "pointer" }}>
              선택삭제
            </div>
          </div>
          <DeleteModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
            selectedProducts={
              deleteProductId ? [deleteProductId] : selectedProducts
            }
          />
          {Object.entries(groupedCartItems).map(([brand, products]) => (
            <BrandSection
              key={brand}
              brand={brand}
              products={products}
              isSelected={selectedBrands.includes(brand)} // 변경
              onBrandSelect={() => handleBrandSelect(brand)}
              onProductSelect={handleProductSelect}
              selectedProducts={selectedProducts}
              openModal={handleOpenModal} // 모달 열기 함수 전달
              onConfirmDelete={handleConfirmDelete} // 삭제 확인 함수 전달
              isModalOpen={isModalOpen}
              setModalOpen={setModalOpen} // 모달 상태 업데이트 함수 전달
              handleOpenModalForSingleDelete={handleOpenModalForSingleDelete} // 특정 제품 삭제 모달 열기 함수 전달
            />
          ))}
        </div>
      </div>
      <div className={`${isAuthenticated ? "purchase_area" : "hide"}`}>
        <div
          className="purchase_btn"
          style={{ padding: "4px" }}
          onClick={handlePurchaseClick}
        >
          구매하기({totalQuantity}개)
        </div>

        <div style={{ fontSize: "18px", fontWeight: "bold", padding: "4px" }}>
          구매금액
        </div>

        <div className="sort_amount">
          <div>상품금액</div>
          <div>{totalPrice.toLocaleString()}원</div>
        </div>

        <div className="sort_amount">
          <div>할인 금액</div>
          <div style={{ color: "blue" }}>-0원</div>
        </div>
        <div className="sort_amount">
          <div>배송비</div>
          <div>배송비 무료</div>
        </div>

        <div className="sort_amount">
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            총 구매 금액
          </div>
          <div style={{ fontWeight: "bold" }}>
            {totalPrice.toLocaleString()}원
          </div>
        </div>
        <div className="sort_amount">
          <div>등급적립</div>
          <div style={{ color: "blue" }}>최대 0원</div>
        </div>
      </div>
      <Cart_bottom />
    </div>
  );
}

export default Cart;
