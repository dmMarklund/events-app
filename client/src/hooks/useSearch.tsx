import { MonthYear } from "../types/types";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import {
  setSearchInput as setReduxSearchInput,
  setSelectedCity as setReduxSelectedCity,
  setSearchQuery as setReduxSearchQuery,
} from "../redux/navigationBarSlice";

interface UseSearchProps {
  filterEvents: (monthYear: MonthYear, city: string, query?: string) => void;
  currentMonth: MonthYear;
}

const useSearch = ({ filterEvents, currentMonth }: UseSearchProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchInput = useSelector(
    (state: RootState) => state.navigationBar.searchInput
  );
  const selectedCity = useSelector(
    (state: RootState) => state.navigationBar.selectedCity
  );
  const searchQuery = useSelector(
    (state: RootState) => state.navigationBar.searchQuery
  );

  const handleSearch = () => {
    navigate("/calendar");
    dispatch(setReduxSearchQuery(searchInput));
    filterEvents(currentMonth, selectedCity, searchInput);
  };

  const resetSearch = () => {
    dispatch(setReduxSearchInput(""));
    dispatch(setReduxSearchQuery(""));
    dispatch(setReduxSelectedCity("All"));
  };

  return {
    searchInput,
    setSearchInput: (input: string) => dispatch(setReduxSearchInput(input)),
    searchQuery,
    handleSearch,
    resetSearch,
  };
};

export default useSearch;
