+++
categories = ["Documentation"]
title = "fugue_backend.py"
+++

# Overview
This script defines a FugueBackend class for PyCaret that utilizes the Fugue library for parallel and distributed computing. The class inherits from the ParallelBackend class and provides functionality for comparing models in PyCaret's model selection process. The backend can run in a distributed environment using Spark or Dask, as well as locally.
  
## _get_context_lock
This function retrieves the "_LOCK" context lock object from the global scope and acts as a thread-safe utility.

## _DisplayUtil Class
A nested class within the main FugueBackend class that initializes and updates display monitors during the execution of parallel tasks. This class will update the display information such as records processed and aggregated metrics. This class provides the following methods:

1. `update(self, df: pd.DataFrame)`: Updates the display with the progress and intermediate output dataframe.
2. `finish(self, df: Any = None)`: Completes the display and shows the final output dataframe.
3. `_create_display(self, progress: int, verbose: bool, monitor_rows: Any)`: Creates an instance of the CommonDisplay class with the specified parameters.

## FugueBackend Class
The main class in the scipt that inherits from `ParallelBackend` and provides functionality for comparing models in a parallel and distributed manner using Fugue. It consists of several methods:

1. `__init__(self, engine: Any = None, conf: Any = None, batch_size: int = 1, display_remote: bool = False, top_only: bool = False)`: Initializes the FugueBackend object with various configuration options.
2. `__getstate__(self) -> Dict[str, Any]`: Returns a dictionary representation of the current FugueBackend object without the "_engine" attribute.
3. `compare_models(self, instance: Any, params: Dict[str, Any]) -> Union[Any, List[Any]]`: Main function that accepts an instance of FugueBackend along with corresponding input parameters to perform model comparison.
4. `_remote_compare_models(self, idx: List[List[Any]], report: Optional[Callable]) -> List[List[Any]]`: Function called remotely to compare a subset of models in parallel. The results are combined and returned to the main compare_models function.

# Risks

## Security Issues
No particular security issues were detected in the code.

## Bugs
No obvious bugs were identified in the code.

# Refactoring Opportunities
The code is well organized and modular. However, larger sections of comments could be added for further clarification.

# User Acceptance Criteria
1. Given a dataset when using FugueBackend, the user should be able to compare models both locally and in a distributed environment.
2. When using remote display, progress updates and metrics should be updated on the user interface.
3. When top_only flag is set, only the top models should be returned.
4. Given a spark session as input, the backend should utilize the given session for parallel executions.
5. When the execution is completed, the display should show the final results including model rankings.
